(function () {
    'use strict';

    const DISABLED = [
        'grid-resizer',
        'query-db',
        //'query-finder',
    ];

    function Log(tag, str, port = null) {
        //if (!ENABLED.has(tag)) {
            //return
        //}
        //
        if (DISABLED.includes(tag)) {
            return;
        }

        if (tag == "worker") {
            port.postMessage(`${tag}: ${str}`);
            return
        }

        let [month, date, year]    = new Date().toLocaleDateString("en-US").split("/");
        let [hour, minute, second] = new Date().toLocaleTimeString("en-US").split(/:| /);

        let o = `${date}-${month}-${year} ${hour}:${minute}:${second}:::${tag}: ${str}`;
        console.log(o);
    }

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

        static truncate(s, max) {
    		if (s.length > max) {
    			return s.substring(0, max) + '...';
    		}
    		return s;
    	}

        static getTimestamp() {
            let d = new Date();
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
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
            return 3
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
                        Log(TAG$2, e.target.error);
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
    const DB_ID_INDEX = "db-id-index";
    const DB_NAME = "connections";

    class ConnectionDB extends BaseDB {
        constructor(options) {
            options.dbName = DB_NAME;
            super(options);
            this.store = "connections";
        }

        onUpgrade(e) {
            Log(TAG$1, `open.onupgradeneeded: ${e.oldVersion}`);
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
        }

        async getAll() {
            //transform data for clients 
            let conns = await super.getAll();
            for (let i = 0; i < conns.length; i++) {
                conns[i] = ConnectionDB.transform(conns[i]);
            }

            return conns;
        }

        async get(id) {
            let conn = await super.get(id);
            return ConnectionDB.transform(conn);
        }

        static transform(conn) {
            delete conn.db_id;
            delete conn.synced_at;
            conn['is-default'] = conn.is_default ?? conn['is-default'];// this will handle legacy dbs
            delete conn.is_default;
            return conn;
        }

        async save(conn) {
            try {
                //make sure there is only one connection with is-default = true
                if (conn['is-default'] == true) {
                    let conns = await super.getAll();
                    conns.forEach(async (c) => {
                        await this.put(c.id, c.pass, false);
                    });
                }

                //search if this connection exists
                let rec = await this.search(conn);
                if (rec) {
                    //if exists , update and return
                    await this.put(rec.id, conn['pass'], conn['is-default']);
                    return rec.id;
                }

                //create new record
                conn[i].is_default = conn[i]['is-default'];
                delete conn[i]['is-default'];

                return await super.save(this.store, conn);

            } catch (e) {
                Log(TAG$1, e.message);
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

                let request = index.get(IDBKeyRange.only([conn.name, conn.user, conn.port, conn.db]));
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
    }

    const TAG = "worker";
    const URL = '/browser-api/sqlite';

    class Worker {
        constructor(port) {
            this.port = port;
        }

        async init() {
            Log(TAG, "worker init", this.port);

            let res = await Utils.fetch(Constants.URL + '/about', false);
            if (res.status == "error") {
                Log(TAG, JSON.stringify(res), this.port);
                return
            }

            this.deviceId = res.data['device-id'];

            res = await Utils.fetch(`${URL}/connections/updated`, false, {
                db: res.data['device-id']
            });

            Log(TAG, JSON.stringify(res), this.port);

    		this.connectionDb = new ConnectionDB({version: Constants.CONN_DB_VERSION});
    		await this.connectionDb.open();

            this.syncUp();
        }

        async syncUp() {
            //find all records missing db_id and sync them up to cloud
            let conns = await this.connectionDb.getAll();
            if (conns.length == 0) {
                return;
            }

            for (let i = 0; i < conns.length; i++) {
                if (!conns[i].db_id) {
                    let res = await fetch(`${URL}/connections`, {
                        body: JSON.stringify(conns[i]),
                        method: "post",
                        headers: {
                            db: this.deviceId,
                            'Content-Type': 'application/json',
                        }
                    });

                    Log(TAG, "Syncing2: " + JSON.stringify(conns[i]), this.port);

                    res = await res.json();
                    Log(TAG, JSON.stringify(res), this.port);

                    if (res.status == "ok") {
                        conns[i].db_id = res.data.db_id;
                        Log(TAG, `syncing: ${JSON.stringify(conns[i])}`, this.port);
                        try {
                            this.connectionDb.sync(conns[i]);
                        } catch (e) {
                            Log(TAG, e, this.port);
                        }
                    }
                }
            }
        }
    }

    onconnect = async (e) => {
        let port = e.ports[0];
        let w = new Worker(port);
        w.init();
    };

}());
