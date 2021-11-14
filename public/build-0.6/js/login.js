import { Err } from './modules/error.js'
import { Logger } from './modules/logger.js'
import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { ConnectionDB } from './modules/connection-db.js'

const TAG = 'login'
class Login {
    constructor() {
        this.keys = ConnectionDB.toDbArray(["id", "name", "user", "pass", "host", "port", "db", "is-default"]);

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

    initDom() {
        this.$addNew = document.getElementById('add-new')
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
        this.version = document.getElementById('version').val
    }

    async init() {
        //sync worker
        const worker = new SharedWorker(`/build-0.6/dist/js/init-worker.js?ver=${this.version}`);
		worker.port.onmessage = (e) => {
			Logger.Log("worker", e.data);
		}

		this.initDom();

		this.connectionDb = new ConnectionDB(new Logger(), {version: Constants.CONN_DB_VERSION});
		await this.connectionDb.open();

        this.initHandlers();
        
        let conns = ConnectionDB.fromDbArray(await this.connectionDb.getAll(this.keys));
        Logger.Log(TAG, JSON.stringify(conns));

        if (conns.length == 0) {
            return;
        }

        this.showRecents(conns);
        let conn = this.getDefault(conns);
        this.setConn(conn);
        this.testConn();
    }

    initHandlers() {
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

            Logger.Log(TAG, `${target.dataset.id}`);
            let connId = parseInt(target.dataset.id);
            let conn = ConnectionDB.fromDb(await this.connectionDb.get(connId, this.keys));
            this.setConn(conn);
            Logger.Log(TAG, JSON.stringify(conn));
            this.testConn();
        });

        document.addEventListener('click', async (e) => {
            let target = event.target;
            if (!target.classList.contains('del-conn')) {
                return
            }

            Logger.Log(TAG, `${target.dataset.id}`);
            let connId = parseInt(target.dataset.id);
            await this.connectionDb.del(connId);
            this.initConns();
        });

        this.$addNew.addEventListener('click', () => {
            this.$name.value = '';
            this.$user.value = '';
            this.$pass.value = '';
            this.$host.value = '';
            this.$port.value = '';
            this.$db.value = '';
        })
    }

    async initConns() {
        document.querySelector('#conn-list').replaceChildren();

        let conns = ConnectionDB.fromDbArray(await this.connectionDb.getAll(this.keys));

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
            Logger.Log(TAG, "c:" + JSON.stringify(conns[i]));
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

            Logger.Log(TAG, `key: ${k}`);
            let $elem = document.getElementById(k);
            $elem.value = conn[k];
        }
    }

    validate(conn) {
        if (!conn.name) {
            throw 'Please choose a connection name!';
            return;
        }

        if (!conn.user) {
            throw 'User name not provided!';
            return;
        }

        if (!conn.pass) {
            throw 'Password not provided!';
            return;
        }

        if (!conn.host) {
            throw 'Hostname/IP not provided!';
            return;
        }

        if (!conn.port) {
            throw 'Port not provided!';
            return;
        }
    }

    async login() {
        let conn = this.getConn()

        try {
            this.validate(conn);
        } catch (e) {
            alert(e);
            this.showError();
            return;
        }

        if (await this.ping(conn) == 'ok') {
            Utils.saveToSession(Constants.CREDS, JSON.stringify(conn));
            let id = await this.connectionDb.save(ConnectionDB.toDb(conn));
            Logger.Log(TAG, `${JSON.stringify(ConnectionDB.toDb(conn))} saved to ${id}`);

            //set agent version for the rest of web app
            let response = await Utils.fetch(Constants.URL + '/about', false);
            //todo: what happens if this is not OK?
            if (response.status == "ok") {
                let formData = new FormData();
                formData.append('device-id', response.data['device-id']);
                formData.append('version', response.data['version']);
                formData.append('os', response.data['os']);

                let res = await fetch("/api/set-version", {
                    body: formData,
                    method: "post"
                });

                res = await res.json();

                Logger.Log(TAG, JSON.stringify(res));

                //todo: what happens if this is not OK?
                if (res.status == "ok") {
                    window.location = '/app/tables';
                }
                return;
            }
        }
    }

    async testConn() {
        this.$testIcon.classList.add('fa-spinner');
        this.$testIcon.classList.add('fa-spin');

        let conn = this.getConn()

        try {
            this.validate(conn);
        } catch (e) {
            alert(e);
            this.showError();
            return;
        }

        let s = await this.ping(conn);
        Logger.Log(TAG, s);

        if (s == 'ok') {
            this.showSuccess();
            return
        }

        this.showError();
    }

    showSuccess() {
        this.$testIcon.classList.remove('fa-spinner');
        this.$testIcon.classList.remove('fa-spin');
        this.$testIcon.classList.remove('fa-times-circle');
        this.$testIcon.classList.remove('has-text-danger');
        this.$testIcon.classList.add('fa-check-circle');
        this.$testIcon.classList.add('has-text-success');
    }

    showError() {
        this.$testIcon.classList.remove('fa-spinner');
        this.$testIcon.classList.remove('fa-spin');
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
