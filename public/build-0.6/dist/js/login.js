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

        static get CONN_DB_VERSION() {
            return 4
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

        static get DEBUG_LOG() {
            return "worker.debug-log"
        }

        static get NEW_CONNECTION() {
            return "worker.new-connection"
        }
    }

    const DISABLED = [
        'grid-resizer',
        'query-db',
        //'query-finder',
    ];

    //workers do not support console.log. How to debug ? 
    // We send a message to the module that initiated worker and 
    // have it print the debug log
    // But sending message requires port which is available only in 
    // worker. How to use a common logger for entire system?
    // We create static "Log" method which can use used for all code that 
    // does not get directly called from worker. For any code that gets
    // called from worker we use the "log" method.

    class Logger {
        constructor(port = null) {
            this.port = port;
        }

        log(tag, str) {
            if (DISABLED.includes(tag)) {
                return;
            }

            if (this.port) {
                this.port.postMessage({
                    type: Constants.DEBUG_LOG,
                    payload: `${tag}: ${str}`
                });
                return
            }

            Logger.print(tag, str);
        }

        static Log(tag, str) {
            if (DISABLED.includes(tag)) {
                return;
            }

            Logger.print(tag, str);
        }

        static print(tag, str) {
            let [month, date, year]    = new Date().toLocaleDateString("en-US").split("/");
            let [hour, minute, second] = new Date().toLocaleTimeString("en-US").split(/:| /);

            let o = `${date}-${month}-${year} ${hour}:${minute}:${second}:::${tag}: ${str}`;
            console.log(o);
        }
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

    	static processTemplate(templ, data) {
    		var re = new RegExp(/{(.*?)}/g);
    		templ = templ.replace(re, function(match, p1) {
    			if (data[p1] || data[p1] == 0 || data[p1] == '') {
    				return data[p1];
    			} else {
    				return match;
    			}
    		});
    		return templ;
    	}

    	//https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
    	static generateNode(templ, data) {
            templ = Utils.processTemplate(templ, data);	
            let template = document.createElement('template');
            template.innerHTML = templ.trim();
            return template.content
        }

        static async fetch(url, handleError = true, headers = {}) {
            try {
                let hdrs = {
                    'X-Request-ID': Utils.uuid()
                };
                hdrs = {...hdrs, ...headers};
                let response = await fetch(url, {
                    headers: hdrs
                });

                Logger.Log(TAG$3, response);

                let json = await response.json();

                if (json.status == 'error') {
                    throw json
                }

                return json
            } catch (e) {
                Logger.Log(TAG$3, e);
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
            Logger.Log(TAG$3, "No data");
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

        static truncate(s, max) {
    		if (s.length > max) {
    			return s.substring(0, max) + '...';
    		}
    		return s;
    	}

        static getTimestamp() {
            let d = (new Date()).toISOString();
            return d.replace(/T/, ' ').replace(/\..*$/, '');
        }
    }

    const TAG$2 = "base-db";
    class BaseDB {
        constructor(logger, options) {
            this.logger = logger;
            this.version = options.version;
            this.dbName = options.dbName;
        }

        async open() {
            return new Promise((resolve, reject) => {
                let req = indexedDB.open(this.dbName, this.version);
                    req.onsuccess = (e) => {
                        this.logger.log(TAG$2, "open.onsuccess");
                        this.db = req.result;
                        resolve(0);
                    };

                    req.onerror = (e) => {
                        this.logger.log(TAG$2, e.target.error);
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
                    this.logger.log(TAG$2, e.target.error);
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
                    this.logger.log(TAG$2, e.target.error);
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

        async get(id, keys = []) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store);
                let objectStore = transaction.objectStore(this.store);
                let request = objectStore.get(id);
                
                request.onsuccess = (e) => {
                    let result = [];
                    if (keys.length > 0) {
                        for (let k in request.result) {
                            if (keys.includes(k)) {
                                result[k] = request.result[k];
                            }
                        }
                    } else {
                        result = request.result;
                    }

                    resolve(result);
                };

                request.onerror = (e) => {
                    resolve(null);
                };
            })
        }

        async getAll(keys = []) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store);
                let objectStore = transaction.objectStore(this.store);

                let results = [];
                objectStore.openCursor().onsuccess = (e) => {
                    var cursor = e.target.result;
                    if (cursor) {
                        if (keys.length > 0) {
                            let r = {};
                            for (let k in cursor.value) {
                                if (keys.includes(k)) {
                                    r[k] = cursor.value[k];
                                }
                            }
                            results.push(r);
                        } else {
                            results.push(cursor.value);
                        }
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };
            })
        }

        static toDb(o = {}) {
            //convert all "_" to "-"
            let r = {};
            for (let k in o) {
                r[k.replaceAll(/-/g, '_')] = o[k];
            }
            return r
        }

        static toDbArray(keys = []) {
            //convert all "-" to "_"
            let result = [];
            keys.forEach((k) => {
                result.push(k.replaceAll(/-/g, '_'));
            });
            return result
        }

        static fromDbArray(vals = []) {
            //convert all "_" to "-"
            let result = [];
            vals.forEach((o) => {
                let r = {};
                for (let k in o) {
                    r[k.replaceAll(/_/g, '-')] = o[k];
                }
                result.push(r);
            });
            return result;
        }

        static fromDb(o = {}) {
            //convert all "_" to "-"
            let r = {};
            for (let k in o) {
                r[k.replaceAll(/_/g, '-')] = o[k];
            }
            return r
        }
    }

    const TAG$1 = "connection-db";
    const CONNECTION_INDEX = "connection-index";
    const DB_ID_INDEX = "db-id-index";
    const DB_NAME = "connections";

    class ConnectionDB extends BaseDB {
        constructor(logger, options) {
            options.dbName = DB_NAME;
            super(logger, options);
            this.logger = logger;
            this.store = "connections";
        }

        onUpgrade(e) {
            this.logger.log(TAG$1, `open.onupgradeneeded: ${e.oldVersion}`);
            if (e.oldVersion < 1) {
                let store = e.currentTarget.result.createObjectStore(
                    this.store, { keyPath: 'id', autoIncrement: true });
                store.createIndex(CONNECTION_INDEX, ["name", "user", "pass", "port", "db"], { unique: true });
            }

            if (e.oldVersion < 2) {
                let store = e.currentTarget.transaction.objectStore(this.store);
                store.createIndex(DB_ID_INDEX, ["id", "db_id"], {unique: true});
            }

            if (e.oldVersion < 3) {
                let store = e.currentTarget.transaction.objectStore(this.store);
                store.deleteIndex(CONNECTION_INDEX);
                store.deleteIndex(DB_ID_INDEX);

                store.createIndex(CONNECTION_INDEX, ["name", "user", "port", "db"], { unique: true });
                store.createIndex(DB_ID_INDEX, ["db_id"], {unique: true});
            }

            if (e.oldVersion < 4) {
                let store = e.currentTarget.transaction.objectStore(this.store);
                store.deleteIndex(CONNECTION_INDEX);

                store.createIndex(CONNECTION_INDEX, ["name", "user", "host", "port", "db"], { unique: true });
            }
        }

        async save(conn) {
            try {
                //make sure there is only one connection with is_default = true
                if (conn['is_default'] == true) {
                    let conns = await super.getAll();
                    conns.forEach(async (c) => {
                        await this.put(c.id, c.pass, false);
                    });
                }

                //search if this connection exists
                let rec = await this.search(conn);
                if (rec) {
                    //if exists , update and return
                    await this.put(rec.id, conn['pass'], conn['is_default']);
                    return rec.id;
                }

                //create new record
                return await super.save(this.store, conn);

            } catch (e) {
                this.logger.log(TAG$1, e.message);
            }
        }

        async put(id, password, isDefault) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store, "readwrite");
                let objectStore = transaction.objectStore(this.store);
                let request = objectStore.get(id);

                request.onsuccess = (e) => {
                    let o = e.target.result;
                    o['pass'] = password;
                    o['is_default'] = isDefault;

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

                let request = index.get(IDBKeyRange.only([conn.name, conn.user, conn.host, conn.port, conn.db]));
                request.onsuccess = (e) => {
                    resolve(request.result);
                };

                request.onerror = (e) => {
                    resolve(e.target.error);
                };
            })
        }

        async sync(conn) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store, "readwrite");
                let objectStore = transaction.objectStore(this.store);
                let request = objectStore.get(conn.id);

                request.onsuccess = (e) => {
                    let o = e.target.result;
                    o['db_id'] = conn.db_id;
                    o['synced_at'] = Utils.getTimestamp();

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

        async findByDbId(id) {
            return new Promise((resolve, reject) => {
                this.logger.log(TAG$1, "findByDbId");

                let transaction = this.db.transaction(this.store);
                let objectStore = transaction.objectStore(this.store);
                let index = objectStore.index(DB_ID_INDEX);

                let request = index.get(IDBKeyRange.only([id]));
                request.onsuccess = (e) => {
                    this.logger.log(TAG$1, JSON.stringify(request.result));
                    resolve(request.result);
                };

                request.onerror = (e) => {
                    this.logger.log(TAG$1, "error");
                    resolve(e.target.error);
                };
            })
        }
    }

    //just a wrapper over connectiondb so we dont have to deal with from/to stuff in 
    //client
    class Connections extends ConnectionDB {
        constructor(logger, options) {
            super(logger, options);
            this.keys = ConnectionDB.toDbArray(["id", "name", "user", "pass", "host", "port", "db", "is-default"]);
        }

        async getAll() {
            return ConnectionDB.fromDbArray(await super.getAll(this.keys));
        }

        async get(id) {
                return ConnectionDB.fromDb(await super.get(id, this.keys));
        }

        async save(conn) {
            return await(super.save(ConnectionDB.toDb(conn)));
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

        initDom() {
            this.$addNew = document.getElementById('add-new');
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
            this.$version = document.getElementById('version');

            //debug only
            document.getElementById('debug-add-conns').addEventListener('click', async () => {
                let conns = [
                    {
                        'name': Utils.uuid(),
                        'user': 'server',
                        'pass': 'dev-server',
                        'host': '127.0.0.1',
                        'port': '3308',
                        'db': 'pankaj-05-24-generico',
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
    		this.initDom();

            //sync worker
            Logger.Log(TAG, `ver: ${this.$version.value}`);
            const worker = new SharedWorker(`/build-0.6/dist/js/init-worker.js?ver=${this.$version.value}`);
            worker.port.onmessage = (e) => {
                switch (e.data.type) {
                    case Constants.DEBUG_LOG:
                        Logger.Log("worker", e.data.payload);
                        break;

                    case Constants.NEW_CONNECTION:
                        this.showConns();
                        break;
                }
            };

            this.connections = new Connections(new Logger(), {version: Constants.CONN_DB_VERSION});
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
                this.showConns();
            });

            this.$addNew.addEventListener('click', () => {
                this.$name.value = '';
                this.$user.value = '';
                this.$pass.value = '';
                this.$host.value = '';
                this.$port.value = '';
                this.$db.value = '';
            });
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
                    item = c.name;
                }

                let n = Utils.generateNode(templ, {
                    id: c.id,
                    item: item
                });

                if (c['is-default'] == true) {
                    n.querySelector('.conn-container').classList.add('highlight');
                }
                $list.appendChild(n);
            });
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
            }

            if (!conn.user) {
                throw 'User name not provided!';
            }

            if (!conn.pass) {
                throw 'Password not provided!';
            }

            if (!conn.host) {
                throw 'Hostname/IP not provided!';
            }

            if (!conn.port) {
                throw 'Port not provided!';
            }
        }

        async login() {
            let conn = this.getConn();

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

            let conn = this.getConn();

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
