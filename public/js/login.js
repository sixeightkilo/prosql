import { Err } from './modules/error.js'
import { Log } from './modules/logger.js'
import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { ConnectionDB } from './modules/connection-db.js'

const TAG = 'login'
class Login {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            await this.init()

            this.$testConn.addEventListener('click', async () => {
                this.testConn()
            })

            this.$login.addEventListener('click', async () => {
                this.login()
            })
        })
    }

    async init() {
        this.connectionDb = new ConnectionDB({version: 1});
        await this.connectionDb.open();

        this.$testConn = document.getElementById('test')
        this.$testIcon = document.querySelector('.test-icon')
        this.$name = document.getElementById('name')
        this.$login = document.getElementById('login')
        this.$user = document.getElementById('user')
        this.$pass = document.getElementById('pass')
        this.$host = document.getElementById('host')
        this.$port = document.getElementById('port')
        this.$db = document.getElementById('db')
        this.$isDefault = document.getElementById('is-default')

        //handle click on connection
        document.addEventListener('click', async (e) => {
            let target = event.target;
            if (!target.classList.contains('conn')) {
                return
            }

            //remove highlight on all element first
            let list = document.querySelectorAll('.highlight');
            list.forEach((e) => {
                e.classList.remove('highlight');
            });

            let parent = target.parentElement;
            parent.classList.add('highlight');

            Log(TAG, `${target.dataset.id}`);
            let connId = parseInt(target.dataset.id);
            let conn = await this.connectionDb.get(connId);
            this.setConn(conn);
            Log(TAG, JSON.stringify(conn));
            this.testConn();
        });

        let conns = await this.connectionDb.getAll();
        if (conns.length == 0) {
            return;
        }

        this.showRecents(conns);
        let conn = this.getDefault(conns);
        this.setConn(conn);
        this.testConn();
    }

    getDefault(conns) {
        //if there is a default set, use it otherwise
        //arbitrarily choose the first connection as current
        for (let i = 0; i < conns.length; i++) {
            if (conns[i]['is-default'] == true) {
                return conns[i];
            }
        }

        return conns[0];
    }

    async showRecents(conns) {
        let list = document.getElementById('conn-list');
        let templ = document.getElementById('conn-template').innerHTML;

        conns.forEach((c) => {
            let item = "No name";
            if (c.name) {
                item = c.name
            }

            let n = Utils.generateNode(templ, {
                id: c.id,
                item: item
            })

            if (c['is-default'] == true) {
                n.querySelector('.conn-container').classList.add('highlight');
            }
            list.appendChild(n);
        })
    }

    setConn(conn) {
        for (let k in conn) {
            if (k == "id") {
                continue;
            }

            if (k == 'is-default') {
                if (conn[k] == true) {
                    this.$isDefault.checked = true;
                } else {
                    this.$isDefault.checked = false;
                }
                continue;
            }

            let $elem = document.getElementById(k);
            $elem.value = conn[k];
        }
    }

    async login() {
        let conn = this.getConn()
        if (await this.ping(conn) == 'ok') {
            Utils.saveToSession(Constants.CREDS, JSON.stringify(conn));
            let id = await this.connectionDb.save(conn);
            Log(TAG, `saved to ${id}`);

            window.location = '/app/content';
        }
    }

    async testConn() {
        this.$testIcon.classList.add('fa-spinner');
        this.$testIcon.classList.add('fa-spin');

        let conn = this.getConn()
        let s = await this.ping(conn);
        Log(TAG, s);

        this.$testIcon.classList.remove('fa-spinner');
        this.$testIcon.classList.remove('fa-spin');

        if (s == 'ok') {
            this.$testIcon.classList.remove('fa-times-circle');
            this.$testIcon.classList.remove('has-text-danger');
            this.$testIcon.classList.add('fa-check-circle');
            this.$testIcon.classList.add('has-text-success');
            return
        }

        this.$testIcon.classList.remove('fa-check-circle');
        this.$testIcon.classList.remove('has-text-success');
        this.$testIcon.classList.add('fa-times-circle');
        this.$testIcon.classList.add('has-text-danger');
    }

    async ping(conn) {
        let json = await Utils.fetch(Constants.URL + '/ping?' + new URLSearchParams(conn), false)
        if (json.status == "error") {
            if (json.msg == Err.ERR_NO_AGENT) {
                window.location = '/install';
                return "error";
            }

            alert(json.msg);
            return "error";
        }

        return "ok";
    }

    getConn() {
        return {
            name: this.$name.value,
            user: this.$user.value,
            pass: this.$pass.value,
            host: this.$host.value,
            port: this.$port.value,
            db: this.$db.value,
            'is-default': this.$isDefault.checked
        }
    }
}

new Login()
