import { Err } from './modules/error.js'
import { Logger } from './modules/logger.js'
import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { ConnectionModel } from './modules/connections.js'
import { PubSub } from './modules/pubsub.js'
import { Workers } from './modules/workers.js'

const TAG = 'connections'
class Connections {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            await this.init()

            this.$testConn.addEventListener('click', async () => {
                this.testConn()
            })

            this.$login.addEventListener('click', async () => {
                this.login()
            })
        });
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

        //debug only
        document.getElementById('debug-add-conns').addEventListener('click', async () => {
            let conns = [
                {
                    'name': Utils.uuid(),
                    'user': 'server',
                    'pass': 'dev-server',
                    'host': '127.0.0.1',
                    'port': '3308',
                    'db': 'test-generico',
                    'is-default': true
                },
            ];

            for (let i = 0; i < conns.length; i++) {
                let id = await this.connections.save(conns[i]);
                Logger.Log(`saved to ${id}`);
            }
        });
    }

    async init() {
        this.workers = new Workers();
        this.workers.initConnectionWorker();

		this.initDom();

        PubSub.subscribe(Constants.NEW_CONNECTIONS, async () => {
            this.showConns();
        });

        this.connections = new ConnectionModel(new Logger(), {version: Constants.CONN_DB_VERSION});
        await this.connections.open();

        this.initHandlers();
        this.showConns();
    }

    async showConns() {
        let conns = await this.connections.getAll();
        Logger.Log(TAG, JSON.stringify(conns));
        this.showRecents(conns);
        let conn = this.getDefault(conns);
        this.setConn(conn);
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
            let conn = await this.connections.get(connId);
            Logger.Log(TAG, "setconn: " + JSON.stringify(conn));
            this.setConn(conn);
            this.testConn();
        });

        document.addEventListener('click', async (e) => {
            let target = event.target;
            if (!target.classList.contains('del-conn')) {
                return
            }

            Logger.Log(TAG, `${target.dataset.id}`);
            let connId = parseInt(target.dataset.id);
            await this.connections.del(connId);

            //force sync up
            this.workers.connectionWorker.port.postMessage({
                type: Constants.CONNECTION_DELETED
            });

            this.showConns();
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
        let $list = document.getElementById('conn-list');
        let templ = document.getElementById('conn-template').innerHTML;
        $list.replaceChildren();

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
            $list.appendChild(n);
        })
    }

    setConn(conn) {
        this.reset();

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
            //sometimes password can be undefined
            if (conn[k]) {
                $elem.value = conn[k];
            }
        }
    }

    reset() {
        this.$name.value = '';
        this.$user.value = '';
        this.$pass.value = '';
        this.$host.value = '';
        this.$port.value = '';
        this.$db.value = '';
        this.$isDefault.checked = false;
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
            let id = await this.connections.save(conn);
            Logger.Log(TAG, `${JSON.stringify(conn)} saved to ${id}`);

            //set agent version for the rest of web app
            let res = await Utils.get(Constants.URL + '/about');
            res = await Utils.post('/browser-api/devices/register', {
                'device-id': res.data['device-id'],
                'version': res.data['version'],
                'os': res.data['os'],
            }, false);

            Logger.Log(TAG, JSON.stringify(res));

            if (res.status == "ok") {
                window.location = '/app/tables';
                return;
            }

            window.location = '/signin';
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
        let json = await Utils.get(Constants.URL + '/ping?' + new URLSearchParams(conn), false)
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

new Connections()
