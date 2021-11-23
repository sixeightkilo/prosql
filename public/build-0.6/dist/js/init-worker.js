(function () {
    'use strict';

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

        static get STATUS_ACTIVE() {
            return "active"
        }

        static get STATUS_DELETED() {
            return "deleted"
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

    	static getRandomIntegerInclusive(min, max) {
    		return Math.floor(Math.random() * (max - min + 1)) + min;
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

        //delete completely from indexeddb
    	async destroy(id) {
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

        //just mark status as deleted
        async del(id) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store, "readwrite");
                let objectStore = transaction.objectStore(this.store);
                let request = objectStore.get(id);

                request.onsuccess = (e) => {
                    let o = e.target.result;
                    o.status = Constants.STATUS_DELETED;
                    let requestUpdate = objectStore.put(o);

                    requestUpdate.onerror = (e) => {
                        resolve(e.target.error);
                    };

                    requestUpdate.onsuccess = (e) => {
                        resolve(0);
                    };
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
                    for (let i = 0; i < conns.length; i++) {
                        await this.put(conns[i].id, conns[i].pass, false);
                    }
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
                    o.pass = password;
                    if (o.is_default != isDefault) {
                        //we set updated at only if is_default has changed. We don't
                        //care about password change
                        o.updated_at = Utils.getTimestamp();
                    }
                    o.is_default = isDefault;

                    let requestUpdate = objectStore.put(o);
                    requestUpdate.onerror = (e) => {
                        resolve(e.target.error);
                    };
                    requestUpdate.onsuccess = (e) => {
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
                    requestUpdate.onerror = (e) => {
                        resolve(e.target.error);
                    };
                    requestUpdate.onsuccess = (e) => {
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
                    resolve(request.result);
                };

                request.onerror = (e) => {
                    this.logger.log(TAG$1, "error");
                    resolve(e.target.error);
                };
            })
        }
    }

    const TAG = "main";
    const URL = '/browser-api/sqlite';
    const SYNCUP_INTERVAL_MIN = 10000;//1 min
    const SYNCUP_INTERVAL_MAX = 20000;//2 min
    const EPOCH_TIMESTAMP = '2021-01-01 00:00:00';

    class Worker {
        constructor(port) {
            this.port = port;
            this.logger = new Logger(this.port);
        }

        async init() {
            let res = await Utils.fetch(Constants.URL + '/about', false);
            if (res.status == "error") {
                this.logger.log(TAG, JSON.stringify(res));
                return
            }

            this.deviceId = res.data['device-id'];

    		this.connectionDb = new ConnectionDB(this.logger, {version: Constants.CONN_DB_VERSION});
    		await this.connectionDb.open();

            this.syncDown();

            this.logger.log(TAG, "Starting syncup timer");
            this.syncUp();
            setInterval(() => {
                this.syncUp();
            }, Utils.getRandomIntegerInclusive(SYNCUP_INTERVAL_MIN, SYNCUP_INTERVAL_MAX));
        }

        async syncDown() {
            let res = await Utils.fetch(`${URL}/connections/updated`, false, {
                db: this.deviceId,
                after: await this.getLastSyncTs()
            });

            this.logger.log(TAG, "Sync down: " + JSON.stringify(res));
            if (res.status == "ok") {
                let updateUI = false;
                let conns = res.data.connections;

                for (let i = 0; i < conns.length; i++) {
                    //check if the remore connection is already present in local db
                    let c = await this.connectionDb.findByDbId(conns[i].id);

                    //this may be deleted on the server. Handle this first
                    if (conns[i].status == "deleted") {
                        if (c == null) {
                            this.logger.log(TAG, `already deleted: ${conns[i].id}`);
                            continue;
                        }

                        this.logger.log(TAG, `deleting: ${JSON.stringify(c)}`);
                        await this.connectionDb.del(c.id);
                        updateUI = true;
                        continue;
                    }

                    //this looks like a new connection
                    if (c == null) {
                        this.logger.log(TAG, `inserting: ${JSON.stringify(c)}`);
                        delete conns[i].created_at;
                        delete conns[i].updated_at;
                        delete conns[i].status;

                        conns[i].db_id = conns[i].id;
                        delete conns[i].id;
                        conns[i].synced_at = Utils.getTimestamp();

                        let id = await this.connectionDb.save(conns[i]);
                        this.logger.log(TAG, `saved to : ${id}`);
                        if (id >= 1) {
                            updateUI = true;
                        }
                    } else {
                        //nope. may be is-default got updated..
                        await this.connectionDb.put(c.id, c.pass, conns[i].is_default);
                        updateUI = true;
                        this.logger.log(TAG, `Updated ${c.id}`);
                    }
                }

                if (updateUI) {
                    this.port.postMessage({
                        type: Constants.NEW_CONNECTIONS,
                    });
                }
            }
        }

        async getLastSyncTs() {
            let conns = await this.connectionDb.getAll();
            this.logger.log(TAG, `l: ${conns.length}`);

            if (conns.length == 0) {
                return EPOCH_TIMESTAMP;
            }
            //get the latest sync time
            let lastSyncTs = EPOCH_TIMESTAMP;
            conns.forEach((c) => {
                if (c.synced_at > lastSyncTs) {
                    lastSyncTs = c.synced_at;
                }
            });

            this.logger.log(TAG, `lastSyncTs: ${lastSyncTs}`);
            return lastSyncTs;
        }

        async syncUp() {
            //find all records missing db_id and sync them up to cloud
            let conns = await this.connectionDb.getAll();
            if (conns.length == 0) {
                this.logger.log(TAG, "Nothing to sync");
                return;
            }

            let deleted = [];
            for (let i = 0; i < conns.length; i++) {
                let isDeleted = ((conns[i].status ?? Constants.STATUS_ACTIVE) == Constants.STATUS_DELETED) ? true : false;

                if (isDeleted) {
                    this.logger.log(TAG, `Deleting ${conns[i].id}`);
                    if (!conns[i].db_id) {
                        //this has not been synced yet. We can safely delete
                        this.connectionDb.del(conns[i].id);
                        continue;
                    }

                    deleted.push(conns[i]);
                    continue;
                }

                //every record may or may not have updated_at
                let updatedAt = conns[i].updated_at ?? EPOCH_TIMESTAMP;

                if (conns[i].db_id) {
                    //if it has a db_id , it is guaranteed to haved synced_at
                    if (conns[i].synced_at > updatedAt) {
                        this.logger.log(TAG, `Skipping ${conns[i].id}: ${conns[i].db_id}`);
                        continue;
                    }
                }

                let res = await fetch(`${URL}/connections`, {
                    body: JSON.stringify(conns[i]),
                    method: "POST",
                    headers: {
                        db: this.deviceId,
                        'Content-Type': 'application/json',
                    }
                });

                res = await res.json();
                this.logger.log(TAG, JSON.stringify(res));

                if (res.status == "ok") {
                    conns[i].db_id = res.data.db_id;
                    this.logger.log(TAG, `syncing: ${JSON.stringify(conns[i])}`);
                    try {
                        this.connectionDb.sync(conns[i]);
                    } catch (e) {
                        this.logger.log(TAG, e, this.port);
                    }
                }
            }

            this.syncDeleted(deleted);
        }

        async syncDeleted(deleted) {
            if (deleted.length == 0) {
                return;
            }

            let ids = [];
            deleted.forEach((d) => {
                ids.push(d.db_id);
            });

            this.logger.log(TAG, JSON.stringify(ids));
            let res = await fetch(`${URL}/connections`, {
                body: JSON.stringify(ids),
                method: "DELETE",
                headers: {
                    db: this.deviceId,
                    'Content-Type': 'application/json',
                }
            });

            res = await res.json();
            this.logger.log(TAG, JSON.stringify(res));
            //delete from local db
            for (let i = 0; i < res.data.ids.length; i++) {
                let c = await this.connectionDb.findByDbId(res.data.ids[i]);
                await this.connectionDb.destroy(c.id);
                this.logger.log(TAG, `Destroyed: ${c.id}`);
            }
        }
    }

    onconnect = async (e) => {
        let port = e.ports[0];
        let w = new Worker(port);
        w.init();
    };

}());
