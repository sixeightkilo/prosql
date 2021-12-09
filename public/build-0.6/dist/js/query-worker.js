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

        static get CONNECTION_SAVED() {
            return 'connection-saved'
        }

        static get CONNECTION_DELETED() {
            return 'connection-deleted'
        }

        static get QUERY_UPDATED() {
            return 'query-updated'
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

        static get DB_ID_INDEX() {
            return "db-id-index";
        }

        static get CONNECTIONS_META_KEY() {
            return 1;
        }

        static get QUERIES_META_KEY() {
            return 2;
        }

        static get CONNECTIONS_META_DB_VERSION() {
            return 1;
        }

        static get QUERIES_META_DB_VERSION() {
            return 1;
        }

        static get QUERY_DB_VERSION() {
            return 39;
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

        static get NEW_QUERIES() {
            return "worker.new-queries"
        }

        static get STATUS_ACTIVE() {
            return "active"
        }

        static get STATUS_DELETED() {
            return "deleted"
        }

        static get EPOCH_TIMESTAMP() {
            return '2021-01-01T00:00:00Z';
        }

        static get LAST_SYNC_TS() {
            return 'last-sync-ts';
        }
    }

    const DISABLED = [
        'grid-resizer',
        //'query-db',
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

    const TAG$5 = "utils";
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

                Logger.Log(TAG$5, response);

                let json = await response.json();

                if (json.status == 'error') {
                    throw json
                }

                return json
            } catch (e) {
                Logger.Log(TAG$5, e);
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
            Logger.Log(TAG$5, "No data");
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

    const TAG$4 = "base-db";
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
                        this.logger.log(TAG$4, "open.onsuccess");
                        this.db = req.result;
                        resolve(0);
                    };

                    req.onerror = (e) => {
                        this.logger.log(TAG$4, e.target.error);
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
                    this.logger.log(TAG$4, e.target.error);
                    resolve(-1);
                };
            })
        }

        async put(store, rec) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction([store], "readwrite");
                let objectStore = transaction.objectStore(store);

                rec.updated_at = new Date();
                let request = objectStore.put(rec);
                request.onsuccess = (e) => {
                    resolve(0);
                };

                request.onerror = (e) => {
                    this.logger.log(TAG$4, e.target.error);
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

                    this.logger.log(TAG$4, JSON.stringify(result));
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

        async sync(conn) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store, "readwrite");
                let objectStore = transaction.objectStore(this.store);
                let request = objectStore.get(conn.id);

                request.onsuccess = (e) => {
                    let o = e.target.result;
                    o['db_id'] = conn.db_id;
                    o['synced_at'] = new Date();

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
                this.logger.log(TAG$4, "findByDbId");

                let transaction = this.db.transaction(this.store);
                let objectStore = transaction.objectStore(this.store);
                let index = objectStore.index(Constants.DB_ID_INDEX);

                let request = index.get(IDBKeyRange.only([id]));
                request.onsuccess = (e) => {
                    resolve(request.result);
                };

                request.onerror = (e) => {
                    this.logger.log(TAG$4, "error");
                    resolve(e.target.error);
                };
            })
        }

        static toDb(o = {}) {
            //convert all "-" to "_"
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

    const TAG$3 = "query-db";
    const CREATED_AT_INDEX = "created-at-index";
    const QUERY_INDEX = "query-index";
    const TERM_INDEX = "term-index";
    const TAG_INDEX = "tag-index";

    class QueryDB extends BaseDB {
        constructor(logger, options) {
            options.dbName = "queries";
            super(logger, options);
            this.logger = logger;
            this.store = "queries";
            this.searchIndex = "search-index";
            this.tagIndex = "tag-index";
        }

        onUpgrade(e) {
            this.logger.log(TAG$3, `onUpgrade: o: ${e.oldVersion} n: ${e.newVersion}`);
            if (e.oldVersion < 2) {
                let store = e.target.result.createObjectStore(
                    this.store, { keyPath: 'id', autoIncrement: true });
                store.createIndex(CREATED_AT_INDEX, "created_at", { unique : false });

                store = e.target.result.createObjectStore(
                    this.searchIndex, { keyPath: 'id', autoIncrement: true });
                store.createIndex(TERM_INDEX, "term", { unique : true });

                store = e.target.result.createObjectStore(
                    this.tagIndex, { keyPath: 'id', autoIncrement: true });
                store.createIndex(TAG_INDEX, "tag", { unique : true });
            }

            if (e.oldVersion < 37) {
                let store = e.currentTarget.transaction.objectStore(this.store);
                store.createIndex(Constants.DB_ID_INDEX, ["db_id"]);
            }
        }

        async save(rec) {
            return new Promise(async (resolve, reject) => {
                //remove all new lines
                rec.query = rec.query.replace(/\r?\n|\r/g, " ");
                //remove extra white spaces
                rec.query = rec.query.replace(/[ ]{2,}/g, " ");
                let terms = rec.query.split(' ');

                //get all unique terms
                //https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
                terms = [...new Set(terms)];

                this.logger.log(TAG$3, JSON.stringify(terms));
                let id = -1;
                try {
                    //apppend timestamp if required
                    if (!rec.created_at) {
                        rec.created_at = new Date();
                    }

                    id = await super.save(this.store, rec);
                    if (id == -1) {
                        resolve(-1);
                        return;
                    }

                    await this.updateSearchIndex(id, terms);
                    await this.updateTagIndex(id, rec.tags);

                    resolve(id);
                } catch (e) {
                    this.logger.log(TAG$3, `error: ${JSON.stringify(e.message)}`);
                    reject(e.message);
                }
            })
        }

        async updateSearchIndex(id, terms) {
            //add id to each of the tags
            for (let i = 0; i < terms.length; i++) {
                let t = terms[i];
                t = t.trim();

                if (t.length <= 1) {
                    continue;
                }

                t = this.cleanup(t);
                try {
                    let rec = await this.findByTerm(t);
                    //add a new tag
                    if (rec == null) {
                        await super.save(this.searchIndex, {
                            term: t,
                            queries:[id]
                        });
                        continue;
                    }

                    //update tag
                    rec['queries'].push(id);
                    this.logger.log(TAG$3, JSON.stringify(rec));
                    super.put(this.searchIndex, {
                        id: rec.id,
                        term: t,
                        queries: rec['queries']
                    });

                } catch (e) {
                    this.logger.log(TAG$3, `error: e.message`);
                }
            }
        }

        async findByTerm(term) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.searchIndex);
                let objectStore = transaction.objectStore(this.searchIndex);
                let index = objectStore.index(TERM_INDEX);

                let key = IDBKeyRange.only(term);
                index.openCursor(key).onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        this.logger.log(TAG$3, JSON.stringify(cursor.value));
                        resolve(cursor.value);
                        return;
                    }

                    resolve(null);
                };
            })
        }

        async updateTagIndex(id, tags) {
            //add id to each of the tags
            for (let i = 0; i < tags.length; i++) {
                let t = tags[i];
                t = t.trim();

                if (t.length <= 1) {
                    continue;
                }

                t = this.cleanup(t);
                try {
                    let rec = await this.findByTag(t);
                    //add a new tag
                    if (rec == null) {
                        await super.save(this.tagIndex, {
                            tag: t,
                            queries:[id]
                        });
                        continue;
                    }

                    //update tag
                    rec['queries'].push(id);
                    this.logger.log(TAG$3, JSON.stringify(rec));
                    super.put(this.tagIndex, {
                        id: rec.id,
                        tag: t,
                        queries: rec['queries']
                    });

                } catch (e) {
                    this.logger.log(TAG$3, `error: e.message`);
                }
            }
        }

        async findByTag(tag) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.tagIndex);
                let objectStore = transaction.objectStore(this.tagIndex);
                let index = objectStore.index(TAG_INDEX);

                let key = IDBKeyRange.only(tag);
                index.openCursor(key).onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        this.logger.log(TAG$3, JSON.stringify(cursor.value));
                        resolve(cursor.value);
                        return;
                    }

                    resolve(null);
                };
            })
        }

        async findByQuery(query) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.dbName);
                let objectStore = transaction.objectStore(this.store);
                let index = objectStore.index(QUERY_INDEX);

                let key = IDBKeyRange.only(query);
                index.openCursor(key).onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        this.logger.log(TAG$3, JSON.stringify(cursor.value));
                        resolve(cursor.value);
                        return;
                    }

                    resolve([]);
                };
            })
        }

        //https://stackoverflow.com/questions/26156292/trim-specific-character-from-a-string
        cleanup(str) {
            //remove table qualifiers like table_name.<...>
            str = str.replace(/^\S+\./, "");

            //remove punctuation marks
            let chars = ['`', '`', ' ', '"', '\'', ',', ';', '+', '-', '=', '!=', '<', '>', '>=', '<='];
            let start = 0, 
                end = str.length;

            while(start < end && chars.indexOf(str[start]) >= 0)
                ++start;

            while(end > start && chars.indexOf(str[end - 1]) >= 0)
                --end;

            return (start > 0 || end < str.length) ? str.substring(start, end) : str;
        }

        async filter(days, tags, terms) {
            //days supercedes everything
            //if days are provided get queries by days first
            //then filter by terms and tags if provided
            this.logger.log(TAG$3, `filter: days ${JSON.stringify(days)} tags ${tags} terms ${terms}`);

            let start, end;
            if (days.hasOwnProperty('start')) {
                start = new Date(Date.now() - (days.start * 24 * 60 * 60 * 1000));
                start.setHours(0);
                start.setMinutes(0);
                start.setSeconds(0);
            }

            if (days.hasOwnProperty('end')) {
                end = new Date(Date.now() - (days.end * 24 * 60 * 60 * 1000));
                end.setHours(23);
                end.setMinutes(59);
                end.setSeconds(59);
            }


            let ids = [];
            if (start || end) {
                this.logger.log(TAG$3, 'filtering');
                ids = await this.searchByCreatedAt(start, end);

                if (ids.length == 0) {
                    //if days were provided and we did not find anything
                    //no need to process further
                    return [];
                }
            }

            if (tags.length > 0) {
                let idsByTag = await this.searchByTags(tags);

                ids = ids.filter(x => idsByTag.includes(x));
                if (ids.length == 0) {
                    //no need to process further
                    return [];
                }
            }

            if (terms.length > 0) {
                let idsByTerm = await this.searchByTerms(terms);

                ids = ids.filter(x => idsByTerm.includes(x));
                if (ids.length == 0) {
                    //no need to process further
                    return [];
                }
            }

            let results = [];
            this.logger.log(TAG$3, `${ids}`);
            for (let i = 0; i < ids.length; i++) {
                results.push(await super.get(ids[i]));
            }

            return results;
        }

        async findByIds(ids) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store);
                let objectStore = transaction.objectStore(this.store);
                let queries = [];

                objectStore.openCursor(null, 'prev').onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        if (ids.includes(cursor.value.id)) {
                            queries.push(cursor.value);
                        }
                        cursor.continue();
                    } else {
                        resolve(queries);
                    }
                };
            });
        }

        async updateTags(rec) {
            await super.put(this.store, rec);
            await this.updateTagIndex(rec.id, rec.tags);
        }

        searchByTerms(terms) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.searchIndex);
                let objectStore = transaction.objectStore(this.searchIndex);
                let ids = [];

                objectStore.openCursor().onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        if (terms.includes(cursor.value.term)) {
                            ids = ids.concat(cursor.value.queries);
                        }
                        cursor.continue();
                    } else {
                        resolve(ids);
                    }
                };
            });
        }

        searchByTags(tags) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.tagIndex);
                let objectStore = transaction.objectStore(this.tagIndex);
                let ids = [];

                objectStore.openCursor().onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        if (tags.includes(cursor.value.tag)) {
                            ids = ids.concat(cursor.value.queries);
                        }
                        cursor.continue();
                    } else {
                        resolve(ids);
                    }
                };
            });
        } 

        listTags(startingWith) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.tagIndex);
                let objectStore = transaction.objectStore(this.tagIndex);
                let index = objectStore.index(TAG_INDEX);
                let tags = [];

                IDBKeyRange.lowerBound(startingWith);
                index.openCursor().onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        tags.push(cursor.value.tag);
                        cursor.continue();
                    } else {
                        resolve(tags);
                    }
                };
            });
        }

        listTerms(startingWith) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.searchIndex);
                let objectStore = transaction.objectStore(this.searchIndex);
                let index = objectStore.index(TERM_INDEX);
                let terms = [];

                IDBKeyRange.lowerBound(startingWith);
                index.openCursor().onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        terms.push(cursor.value.term);
                        cursor.continue();
                    } else {
                        resolve(terms);
                    }
                };
            });
        }

        searchByCreatedAt(s, e) {
            return new Promise((resolve, reject) => {
                this.logger.log(TAG$3, `s: ${s} e: ${e}`);

                let transaction = this.db.transaction(this.store);
                let objectStore = transaction.objectStore(this.store);
                let index = objectStore.index(CREATED_AT_INDEX);

                // s -----> e ----> now
                let key;
                if (s && e) {
                    key = IDBKeyRange.bound(s, e);
                } else if (s) {
                    key = IDBKeyRange.lowerBound(s);
                } else if (e) {
                    key = IDBKeyRange.upperBound(e);
                } else {
                    resolve([]);
                    return;
                }

                let queries = [];
                index.openCursor(key, "prev").onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        this.logger.log(TAG$3, `id: ${cursor.value.created_at.toISOString()}`);
                        queries.push(cursor.value.id);
                        cursor.continue();
                    } else {
                        resolve(queries);
                    }
                };
            });
        }
    }

    const TAG$2 = "queries-meta-db";

    class QueriesMetaDB extends BaseDB {
        constructor(logger, options) {
            options.dbName = "queries_meta";
            super(logger, options);
            this.logger = logger;
            this.store = "queries_meta";
        }

        onUpgrade(e) {
            this.logger.log(TAG$2, `onUpgrade: o: ${e.oldVersion} n: ${e.newVersion}`);
            if (e.oldVersion < 1) {
                e.target.result.createObjectStore(
                    this.store, { keyPath: 'id', autoIncrement: true });
            }
        }

        async save(rec) {
            this.logger.log(TAG$2, "save");
            let r = await super.get(rec.id);

            if (r != null) {
                await super.put(this.store, rec);
                return
            }

            await super.save(this.store, rec);
        }
    }

    const TAG$1 = "main";

    class BaseWorker {
        constructor(port) {
            this.port = port;
            this.logger = new Logger(this.port);

            this.port.onmessage = (m) => {
                this.handleMessage(m);
            };
        }

        async init() {
            let res = await Utils.fetch(Constants.URL + '/about', false);
            if (res.status == "error") {
                this.logger.log(TAG$1, JSON.stringify(res));
                return
            }

            this.deviceId = res.data['device-id'];
        }

        async getLastSyncTs(db, id) {
            let rec = await db.get(parseInt(id));
            if (rec == null) {
                return new Date(Constants.EPOCH_TIMESTAMP);
            }

            return rec.last_sync_ts
        }

        async setLastSyncTs(db, id) {
            await db.save({
                id: parseInt(id),
                last_sync_ts: new Date()
            });
        }
    }

    const TAG = "main";
    const URL = '/browser-api/sqlite';
    const LIMIT = 50;

    class QueryWorker extends BaseWorker {
        async handleMessage(m) {
            this.logger.log(TAG, JSON.stringify(m.data));
            switch (m.data.type) {
            case Constants.QUERY_SAVED:
            case Constants.QUERY_UPDATED:
                this.syncUp();
                break
            }
        }

        async init() {
            await super.init();
            this.logger.log(TAG, "deviceid:" + this.deviceId);

            this.queryDb = new QueryDB(this.logger, {version: Constants.QUERY_DB_VERSION});
            await this.queryDb.open();

            this.metaDB = new QueriesMetaDB(this.logger, {version: Constants.QUERIES_META_DB_VERSION});
            await this.metaDB.open();

            this.syncDown();
            this.syncUp();
        }

        async syncUp() {
            //find all records missing db_id and sync them up to cloud
            let queries = await this.queryDb.getAll();
            if (queries.length == 0) {
                this.logger.log(TAG, "Nothing to sync");
                return;
            }

            let deleted = [];
            for (let i = 0; i < queries.length; i++) {
                //when we delete from UI, we just mark the status as deleted, then sync up later
                let isDeleted = ((queries[i].status ?? Constants.STATUS_ACTIVE) == Constants.STATUS_DELETED) ? true : false;

                if (isDeleted) {
                    this.logger.log(TAG, `Deleting ${queries[i].id}`);
                    if (!queries[i].db_id) {
                        //this has not been synced yet. We can safely delete
                        this.queryDb.del(queries[i].id);
                        continue;
                    }

                    deleted.push(queries[i]);
                    continue;
                }

                if (queries[i].db_id) {
                    //every record may or may not have updated_at
                    let updatedAt = queries[i].updated_at ?? new Date(Constants.EPOCH_TIMESTAMP);

                    //if it has a db_id , it is guaranteed to haved synced_at
                    if (queries[i].synced_at > updatedAt) {
                        this.logger.log(TAG, `Skipping ${queries[i].id}: ${queries[i].db_id}`);
                        continue;
                    }
                }

                let res = await fetch(`${URL}/queries`, {
                    body: JSON.stringify(queries[i]),
                    method: "POST",
                    headers: {
                        db: this.deviceId,
                        'Content-Type': 'application/json',
                    }
                });

                res = await res.json();
                this.logger.log(TAG, JSON.stringify(res));

                if (res.status == "ok") {
                    queries[i].db_id = res.data.db_id;
                    this.logger.log(TAG, `syncing: ${JSON.stringify(queries[i])}`);
                    this.queryDb.sync(queries[i]);
                }
            }
        }

        async syncDown() {
            this.logger.log(TAG, "syncDown");
            let after = await this.getLastSyncTs(this.metaDB, Constants.QUERIES_META_KEY);
            after = after.toISOString();
            this.logger.log(TAG, `after: ${after}`);

            let updateUI = false;

            let offset = 0;
            do {
                let res = await this.fetchRecs(after, LIMIT, offset);
                this.logger.log(TAG, `${JSON.stringify(res)}`);
                if (res.status == "error") {
                    this.logger.log(TAG, "Syncdown error: " + res.msg);
                    return;
                }

                let queries = res.data.queries ?? [];

                if (queries.length == 0) {
                    break;
                }

                for (let i = 0; i < queries.length; i++) {
                    //check if the remote query is already present in local db
                    this.logger.log(TAG, `syncDown: ${i}`);
                    let q = await this.queryDb.findByDbId(queries[i].id);

                    //this may be deleted on the server. Handle this first
                    if (queries[i].status == "deleted") {
                        await this.deleteRec(q);
                        updateUI = true;
                        continue;
                    }

                    //this looks like a new query
                    if (q == null) {
                        let id = await this.insertRec(queries[i]);
                        if (id >= 1) {
                            updateUI = true;
                        }
                    } else {
                        //nope. may be tags got updated
                        await this.updateRec(q, queries[i].tags);
                        updateUI = true;
                    }
                }

                offset += LIMIT;
            } while (true);

            if (updateUI) {
                this.port.postMessage({
                    type: Constants.NEW_QUERIES,
                });
            }

            this.setLastSyncTs(this.metaDB, Constants.QUERIES_META_KEY);
        }

        async fetchRecs(after, limit, offset) {
            return await Utils.fetch(`${URL}/queries/updated`, false, {
                db: this.deviceId,
                after: after,
                limit: limit,
                offset: offset
            });
        }

        async insertRec(rec) {
            this.logger.log(TAG, `inserting: ${JSON.stringify(rec.id)}`);
            rec.db_id = rec.id;
            delete rec.id;

            rec.synced_at = new Date();

            let id = await this.queryDb.save(rec);
            this.logger.log(TAG, `saved to : ${id}`);
            return id
        }

        async updateRec(q, tags) {
            q.tags = tags;
            await this.queryDb.updateTags(q);
            await this.queryDb.sync(q);
            this.logger.log(TAG, `Updated ${q.id}`);
        }

        async deleteRec(q) {
            if (q == null) {
                this.logger.log(TAG, `already deleted`);
                return;
            }

            this.logger.log(TAG, `deleting: ${JSON.stringify(q)}`);
            await this.queryDb.del(q.id);
        }
    }

    onconnect = async (e) => {
        let port = e.ports[0];
        let w = new QueryWorker(port);
        w.init();
    };

}());
