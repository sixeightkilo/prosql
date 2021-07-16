import { Err } from './modules/error.js'
import { Log } from './modules/logger.js'
import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'

const TAG = 'login'
class Login {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.init()

            this.$testConn.addEventListener('click', async () => {
                this.testConn()
            })

            this.$login.addEventListener('click', async () => {
                this.login()
            })
        })
    }

    async init() {
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

            Log(TAG, `${target.dataset.id}`);
            let connId = parseInt(target.dataset.id);
            this.conn = await Utils.get(connId);
            this.setConn(this.conn);
            Log(TAG, JSON.stringify(this.conn));
            this.testConn();
        });

        let conns = await Utils.getAllConnections();
        if (conns.length == 0) {
            return;
        }

        this.showRecents(conns);
        this.setCurrent(conns);
        this.setConn(this.conn);
        this.testConn();
    }

    setCurrent(conns) {
        //if there is a default set, use it otherwise
        //arbitrarily choose the first connection as current
        for (let i = 0; i < conns.length; i++) {
            if (conns[i]['is-default'] == true) {
                this.conn = conns[i];
                return;
            }
        }

        this.conn = conns[0];
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
            let id = await Utils.saveConn(conn);
            Log(TAG, `saved to ${id}`);

            window.location = '/app';
        }
    }

    isNewConn(conn) {
        //compare input fields with this.conn
        if (!this.conn) {
            return true;
        }

        for (let k in conn) {
            if (k == 'is-default') {
                //ignore is-default key
                continue;
            }
            if (conn[k] != this.conn[k]) {
                return true;
            }
        }

        return false;
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
