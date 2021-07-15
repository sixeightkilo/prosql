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

        document.addEventListener('click', async (e) => {
            let target = event.target;
            if (!target.classList.contains('conn')) {
                return
            }
            Log(TAG, `${target.dataset.id}`);
            let o = await Utils.get(parseInt(target.dataset.id));
            Log(TAG, JSON.stringify(o));
        });

        let conns = await Utils.getAllConnections();
        if (conns.length == 0) {
            return;
        }

        this.showRecents(conns);
        this.setCreds(conns[0]);
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

    setCreds(conn) {
        for (let k in conn) {
            if (k == "id") {
                continue;
            }
            let $elem = document.getElementById(k);
            $elem.value = conn[k];
        }
    }

    async login() {
        let creds = this.getCreds()
        if (await this.ping(creds) == 'ok') {
            Utils.saveToSession(Constants.CREDS, JSON.stringify(creds));
            await Utils.saveConn(creds);
            //window.location = '/app';
        }
    }

    async testConn() {
        this.$testIcon.classList.add('fa-spinner');
        this.$testIcon.classList.add('fa-spin');

        let creds = this.getCreds()
        let s = await this.ping(creds);
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

    async ping(creds) {
        let json = await Utils.fetch(Constants.URL + '/ping?' + new URLSearchParams(creds), false)
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

    getCreds() {
        return {
            name: this.$name.value,
            user: this.$user.value,
            pass: this.$pass.value,
            host: this.$host.value,
            port: this.$port.value,
            db: this.$db.value
        }
    }
}

new Login()
