(function () {
    'use strict';

    class Err {
        static get ERR_NONE () {
            return 'none'
        }

        static get ERR_NO_AGENT () {
            return 'no-agent'
        }

        static get ERR_INVALID_USER_INPUT() {
            return 'invalid-user-input'
        }

        static get ERR_INVALID_SESSION_ID() {
            return 'invalid-session-id'
        }

        static get ERR_INVALID_CURSOR_ID() {
            return 'invalid-cursor-id'
        }

        static get ERR_DB_ERROR() {
            return 'db-error'
        }

        static get ERR_UNRECOVERABLE() {
            return 'unrecoverable-error'
        }

        static handle(err) {
            if (err.error == Err.ERR_NO_AGENT) {
                window.location = '/install';
                return;
            }

            if (err.error == Err.ERR_INVALID_SESSION_ID) {
                window.location = '/login';
                return;
            }

            alert(err.error);
        }
    }

    const DISABLED = [
        'grid-resizer',
        'query-db',
        'query-finder',
    ];

    function Log(tag, str) {
        //if (!ENABLED.has(tag)) {
            //return
        //}
        //
        if (DISABLED.includes(tag)) {
            return;
        }

        let [month, date, year]    = new Date().toLocaleDateString("en-US").split("/");
        let [hour, minute, second] = new Date().toLocaleTimeString("en-US").split(/:| /);

        console.log(`${date}-${month}-${year} ${hour}:${minute}:${second}:::${tag}: ${str}`);
    }

    const TAG$3 = "utils";
    class Utils {
        static saveToSession(key, val) {
            window.sessionStorage.setItem(key, val);
        }

        static getFromSession(key) {
            return window.sessionStorage.getItem(key)
        }


        static saveToLocalStorage(key, value) {
            window.localStorage.setItem(key, value);
        }

        static getFromLocalStorage(key) {
            return window.localStorage.getItem(key) ?? null;
        }

        //https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
        static generateNode(templ, data) {
            let re = new RegExp(/{(.*?)}/g);

            templ = templ.replace(re, function(match, p1) {
                if (data[p1] || data[p1] == 0 || data[p1] == '') {
                    return data[p1];
                } else {
                    return match;
                }
            });

            let template = document.createElement('template');
            template.innerHTML = templ.trim();
            return template.content
        }

        static async fetch(url, handleError = true) {
            try {
                let response = await fetch(url, {
                    headers: {
                        'X-Request-ID': Utils.uuid()
                    }
                });

                Log(TAG$3, response);

                let json = await response.json();

                if (json.status == 'error') {
                    throw json
                }

                return json
            } catch (e) {
                Log(TAG$3, e);
                let res = {
                    'status' : 'error',
                    'data': null,
                };

                if (e instanceof TypeError) {
                    if (!handleError) {
                        res.msg = Err.ERR_NO_AGENT;
                        return res;
                    }
                    //user must install agent
                    window.location = '/install';
                    return;
                }

                res.msg = e.msg;
                if (res.msg == Err.ERR_INVALID_SESSION_ID) {
                    //user must login
                    window.location = '/login';
                    return;
                }

                //let client handle this
                if (!handleError) {
                    return res
                }

                if (res.msg == Err.ERR_INVALID_CURSOR_ID) {
                    //let caller handle this too
                    return res
                }

                //common error handling
                if (res.msg) {
                    //normal error. Display to user
                    alert(res.msg);
                    return res
                }
            }
        }

        static async setOptions($ctx, values, def) {
            $ctx.replaceChildren();

            let $ot = document.getElementById('option-template');
            let ot = $ot.innerHTML;

            values.forEach((v) => {
                let h = Utils.generateNode(ot, {value: v});
                $ctx.append(h);
            });

            $ctx.value = def;
        }

        static showAlert(msg, t) {
            let $alrt = document.getElementById('alert');
            let $msg = $alrt.querySelector('.msg');
            $msg.innerHTML = msg;
            $alrt.style.display = 'block';

            let bodyDims = document.querySelector('body').getBoundingClientRect();
            $alrt.style.left = (bodyDims.width / 2) + 'px';

            setTimeout(() => {
                $alrt.style.display = 'none';
            }, t);
        }

        static showNoData() {
            Log(TAG$3, "No data");
        }

        //https://gist.github.com/gordonbrander/2230317
        static uuid() {
            // Math.random should be unique because of its seeding algorithm.
            // Convert it to base 36 (numbers + letters), and grab the first 9 characters
            // after the decimal.
            return '_' + Math.random().toString(36).substr(2, 9);
        };

        static getOffset(el) {
            const rect = el.getBoundingClientRect();
            return {
                left: rect.left + window.scrollX,
                top: rect.top + window.scrollY,
                width: rect.width,
                height: rect.height,
            };
        }

       static extractColumns(arr) {
            let cols = [];
            arr.forEach((e) => {
                cols.push(e[1]);
            });

            return cols
        }
    }

    class Constants {
        //hotkeys
        static get SHIFT_A() {
            return 'Alt+Shift+A'
        }

        static get SHIFT_R() {
            return 'Alt+Shift+R'
        }

        static get SHIFT_T() {
            return 'Alt+Shift+T'
        }

        static get SHIFT_O() {
            return 'Alt+Shift+O'
        }

        static get SHIFT_E() {
            return 'Alt+Shift+E'
        }

        static get SHIFT_N() {
            return 'Alt+Shift+N'
        }

        static get SHIFT_P() {
            return 'Alt+Shift+P'
        }

        static get SHIFT_L() {
            return 'Alt+Shift+L'
        }

        static get SHIFT_S() {
            return 'Alt+Shift+S'
        }

        static get SHIFT_BACK() {
            return 'Alt+Shift+,'
        }

        //commands triggered by user
        static get CMD_RUN_QUERY() {
            return 'cmd.run-query'
        }

        static get CMD_RUN_ALL() {
            return 'cmd.run-all'
        }

        static get CMD_FORMAT_QUERY() {
            return 'cmd.format-query'
        }

        static get CMD_EXPORT() {
            return 'cmd.export'
        }

        static get CMD_CLEAR_FILTER() {
            return 'cmd.clear-filter'
        }

        static get CMD_NEXT_ROWS() {
            return 'cmd.next-rows'
        }

        static get CMD_PREV_ROWS() {
            return 'cmd.prev-rows'
        }

        static get CMD_FORMAT_QUERY() {
            return 'cmd.format-query'
        }

        static get CMD_EXPORT_TABLE() {
            return 'cmd.export-table'
        }

        static get CMD_SEARCH_TABLES() {
            return 'cmd.search-tables'
        }


        static get CMD_BACK() {
            return 'cmd.back'
        }

        //events
        static get COLUMNS_SELECTED() {
            return 'cmd.columns-selected'
        }

        static get STREAM_ERROR() {
            return 'stream.stream-error'
        }

        static get SORT_REQUESTED() {
            return "table-utils.sort-requested"
        }

        static get QUERY_CANCELLED() {
            return 'table-utils.query-cancelled'
        }

        static get TABLE_SELECTED() {
            return 'tables.table-selected'
        }

        static get CELL_EDITED() {
            return 'tables.cell-edited'
        }

        static get TABLE_CHANGED() {
            return 'table-contents.table-changed'
        }

        static get DB_CHANGED() {
            return 'appbar.db-changed'
        }

        static get GRID_H_RESIZED() {
            return "gridh.resized"
        }

        static get QUERY_DISPATCHED() {
            return 'query-dispatched'
        }

        static get FILE_UPLOADED() {
            return 'file-uploaded'
        }

        static get QUERY_SAVED() {
            return 'query-saved'
        }

        static get SESSION_ID() {
            return 'session-id'
        }

        static get URL() {
            return 'http://localhost:23890'
        }

        static get WS_URL() {
            return 'ws://localhost:23890'
        }

        static get DB_NAME() {
            return 'prosql'
        }

        static get DB_VERSION() {
            return 1
        }

        static get CONNECTIONS() {
            return 'connections'
        }

        static get COLUMN_SELECTIONS() {
            return 'column-selections'
        }

        static get BATCH_SIZE() {
            return 1000
        }

        static get BATCH_SIZE_WS() {
            return 1000
        }

        static get CREDS() {
            return 'creds'
        }

        static get SYSTEM() {
            return 'system'
        }

        static get USER() {
            return 'user'
        }

        static get QUERY_DB_VERSION() {
            return 2
        }

        static get INIT_PROGRESS() {
            return "init-progress"
        }

        static get START_PROGRESS() {
            return "start-progress"
        }

        static get STOP_PROGRESS() {
            return "stop-progress"
        }

        static get UPDATE_PROGRESS() {
            return "update-progress"
        }

    }

    const TAG$2 = "base-db";
    class BaseDB {
        constructor(options) {
            this.version = options.version;
            this.dbName = options.dbName;
        }

        async open() {
            return new Promise((resolve, reject) => {
                let req = indexedDB.open(this.dbName, this.version);
                    req.onsuccess = (e) => {
                        Log(TAG$2, "open.onsuccess");
                        this.db = req.result;
                        resolve(0);
                    };

                    req.onerror = (e) => {
                        Log(TAG$2, "open.onerror");
                        reject(e.target.errorCode);
                    };

                    req.onupgradeneeded = (evt) => {
                        this.onUpgrade(evt);
                    };
            })
        }

        async save(store, rec) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction([store], "readwrite");

                let objectStore = transaction.objectStore(store);
                let request = objectStore.add(rec);
                request.onsuccess = (e) => {
                    resolve(e.target.result);
                };

                request.onerror = (e) => {
                    Log(TAG$2, e.target.error);
                    resolve(-1);
                };
            })
        }

        async put(store, rec) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction([store], "readwrite");
                let objectStore = transaction.objectStore(store);

                let request = objectStore.put(rec);
                request.onsuccess = (e) => {
                    resolve(0);
                };

                request.onerror = (e) => {
                    Log(TAG$2, e.target.error);
                    resolve(-1);
                };
            })
        }

        async del(id) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store, "readwrite");
                let objectStore = transaction.objectStore(this.store);
                let request = objectStore.delete(id);

                request.onsuccess = (e) => {
                    resolve(0);
                };

                request.onerror = (e) => {
                    resolve(e.target.error);
                };
            })
        }

        async get(id) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store);
                let objectStore = transaction.objectStore(this.store);
                let request = objectStore.get(id);

                request.onsuccess = (e) => {
                    resolve(request.result);
                };

                request.onerror = (e) => {
                    resolve(null);
                };
            })
        }

        async getAll() {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store);
                let objectStore = transaction.objectStore(this.store);

                let results = [];
                objectStore.openCursor().onsuccess = (e) => {
                    var cursor = e.target.result;
                    if (cursor) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };
            })
        }
    }

    const TAG$1 = "connection-db";
    const CONNECTION_INDEX = "connection-index";
    const DB_NAME = "connections";

    class ConnectionDB extends BaseDB {
        constructor(options) {
            options.dbName = DB_NAME;
            super(options);
            this.store = "connections";
        }

        onUpgrade(e) {
            Log(TAG$1, "open.onupgradeneeded");
            var store = e.currentTarget.result.createObjectStore(
                this.store, { keyPath: 'id', autoIncrement: true });
            store.createIndex(CONNECTION_INDEX, ["name", "user", "pass", "port", "db"], { unique: true });
        }

        async save(conn) {
            try {
                //make sure there is only one connection with is-default = true
                if (conn['is-default'] == true) {
                    let conns = await super.getAll();
                    conns.forEach(async (c) => {
                        await this.put(c.id, false);
                    });
                }

                //search if this connection exists
                let rec = await this.search(conn);
                if (rec) {
                    //if exists , update and return
                    await this.put(rec.id, conn['is-default']);
                    return rec.id;
                }

                //create new record
                return await super.save(this.store, conn);

            } catch (e) {
                Log(TAG$1, e.message);
            }
        }

        async put(id, isDefault) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store, "readwrite");
                let objectStore = transaction.objectStore(this.store);
                let request = objectStore.get(id);

                request.onsuccess = (e) => {
                    let o = e.target.result;
                    o['is-default'] = isDefault;

                    let requestUpdate = objectStore.put(o);
                    requestUpdate.onerror = function(event) {
                        resolve(e.target.error);
                    };
                    requestUpdate.onsuccess = function(event) {
                        resolve(0);
                    };
                };

                request.onerror = (e) => {
                    resolve(e.target.error);
                };
            })
        }

        async search(conn) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store);
                let objectStore = transaction.objectStore(this.store);
                let index = objectStore.index(CONNECTION_INDEX);

                let request = index.get(IDBKeyRange.only([conn.name, conn.user, conn.pass, conn.port, conn.db]));
                request.onsuccess = (e) => {
                    resolve(request.result);
                };

                request.onerror = (e) => {
                    resolve(e.target.error);
                };
            })
        }

    }

    const TAG = 'login';
    class Login {
        constructor() {
            document.addEventListener('DOMContentLoaded', async () => {
                await this.init();

                this.$testConn.addEventListener('click', async () => {
                    this.testConn();
                });

                this.$login.addEventListener('click', async () => {
                    this.login();
                });
            });
        }

        async init() {
            this.connectionDb = new ConnectionDB({version: 1});
            await this.connectionDb.open();

            this.$testConn = document.getElementById('test');
            this.$testIcon = document.querySelector('.test-icon');
            this.$name = document.getElementById('name');
            this.$login = document.getElementById('login');
            this.$user = document.getElementById('user');
            this.$pass = document.getElementById('pass');
            this.$host = document.getElementById('host');
            this.$port = document.getElementById('port');
            this.$db = document.getElementById('db');
            this.$isDefault = document.getElementById('is-default');

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

            document.addEventListener('click', async (e) => {
                let target = event.target;
                if (!target.classList.contains('del-conn')) {
                    return
                }

                Log(TAG, `${target.dataset.id}`);
                let connId = parseInt(target.dataset.id);
                await this.connectionDb.del(connId);
                this.initConns();
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

        async initConns() {
            document.querySelector('#conn-list').replaceChildren();
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
                    item = c.name;
                }

                let n = Utils.generateNode(templ, {
                    id: c.id,
                    item: item
                });

                if (c['is-default'] == true) {
                    n.querySelector('.conn-container').classList.add('highlight');
                }
                list.appendChild(n);
            });
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
            let conn = this.getConn();
            if (!conn.name) {
                alert('Please choose a connection name!');
                return;
            }

            if (await this.ping(conn) == 'ok') {
                Utils.saveToSession(Constants.CREDS, JSON.stringify(conn));
                let id = await this.connectionDb.save(conn);
                Log(TAG, `saved to ${id}`);

                //set agent version for the rest of web app
                let response = await Utils.fetch(Constants.URL + '/about', false);
                //todo: what happens if this is not OK?
                if (response.status == "ok") {
                    let formData = new FormData();
                    formData.append('device-id', response.data['device-id']);
                    formData.append('version', response.data['version']);

                    let res = await fetch("/api/set-version", {
                        body: formData,
                        method: "post"
                    });

                    res = await res.json();

                    Log(TAG, JSON.stringify(res));

                    //todo: what happens if this is not OK?
                    if (res.status == "ok") {
                        window.location = '/app/content';
                    }
                    return;
                }
            }
        }

        async testConn() {
            this.$testIcon.classList.add('fa-spinner');
            this.$testIcon.classList.add('fa-spin');

            let conn = this.getConn();
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
            let json = await Utils.fetch(Constants.URL + '/ping?' + new URLSearchParams(conn), false);
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

    new Login();

}());
