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
        static get DB_RENAMED() {
            return 'db-menu.db-renamed'
        }

        static get DB_DELETED() {
            return 'db-menu.db-deleted'
        }

        static get TABLE_RENAMED() {
            return 'ops-menu.table-renamed'
        }

        static get TABLE_TRUNCATED() {
            return 'ops-menu.table-truncated'
        }

        static get ROW_SELECTED() {
            return 'table-utils.row-selected'
        }

        static get ROW_DELETED() {
            return 'row-deleter.row-deleted'
        }


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

        static get SIGNIN_REQUIRED() {
            return "worker.signin-required"
        }

        static get NEW_CONNECTIONS() {
            return "worker.new-connection"
        }

        static get NEW_QUERIES() {
            return "worker.new-queries"
        }

        static get EXECUTE_SAVE_REC() {
            return "worker.execute-save-rec"
        }

        static get EXECUTE_SUCCESS() {
            return "app.execute-success"
        }

        static get EXECUTE_ERROR() {
            return "app.execute-error"
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

        static get ERR_SIGNIN_REQUIRED() {
            return 'signin-required'
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
                window.location = '/connections';
                return;
            }

            alert(err.error);
        }
    }

    const TAG$p = "base-db";
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
                        this.logger.log(TAG$p, "open.onsuccess");
                        this.db = req.result;
                        resolve(0);
                    };

                    req.onerror = (e) => {
                        this.logger.log(TAG$p, e.target.error);
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
                    this.logger.log(TAG$p, e.target.error);
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
                    this.logger.log(TAG$p, e.target.error);
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

                    this.logger.log(TAG$p, JSON.stringify(result));
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

        //remove db_id so that this record can be synced again with 
        //a different db
        async reset(rec) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store, "readwrite");
                let objectStore = transaction.objectStore(this.store);
                let request = objectStore.get(rec.id);

                request.onsuccess = (e) => {
                    let o = e.target.result;
                    o['db_id'] = null;
                    o['synced_at'] = new Date(Constants.EPOCH_TIMESTAMP);

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

        async sync(rec) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store, "readwrite");
                let objectStore = transaction.objectStore(this.store);
                let request = objectStore.get(rec.id);

                request.onsuccess = (e) => {
                    let o = e.target.result;
                    o['db_id'] = rec.db_id;
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
                this.logger.log(TAG$p, "findByDbId");

                let transaction = this.db.transaction(this.store);
                let objectStore = transaction.objectStore(this.store);
                let index = objectStore.index(Constants.DB_ID_INDEX);

                let request = index.get(IDBKeyRange.only([id]));
                request.onsuccess = (e) => {
                    resolve(request.result);
                };

                request.onerror = (e) => {
                    this.logger.log(TAG$p, "error");
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

    const TAG$o = "query-db";
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
            this.logger.log(TAG$o, `onUpgrade: o: ${e.oldVersion} n: ${e.newVersion}`);
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
                //rec.query = rec.query.replace(/\r?\n|\r/g, " ");
                //remove extra white spaces
                rec.query = rec.query.replace(/[ ]{2,}/g, " ");
                //let terms = rec.query.split(' ');

                //get all unique terms
                //https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
                //terms = [...new Set(terms)];

                this.logger.log(TAG$o, JSON.stringify(rec.terms));
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

                    await this.updateSearchIndex(id, rec.terms);
                    await this.updateTagIndex(id, rec.tags);

                    resolve(id);
                } catch (e) {
                    this.logger.log(TAG$o, `error: ${JSON.stringify(e.message)}`);
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
                    this.logger.log(TAG$o, JSON.stringify(rec));
                    super.put(this.searchIndex, {
                        id: rec.id,
                        term: t,
                        queries: rec['queries']
                    });

                } catch (e) {
                    this.logger.log(TAG$o, `error: e.message`);
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
                        this.logger.log(TAG$o, JSON.stringify(cursor.value));
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
                    this.logger.log(TAG$o, JSON.stringify(rec));
                    super.put(this.tagIndex, {
                        id: rec.id,
                        tag: t,
                        queries: rec['queries']
                    });

                } catch (e) {
                    this.logger.log(TAG$o, `error: e.message`);
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
                        this.logger.log(TAG$o, JSON.stringify(cursor.value));
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
                        this.logger.log(TAG$o, JSON.stringify(cursor.value));
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

            while (start < end && chars.indexOf(str[start]) >= 0)
                ++start;

            while (end > start && chars.indexOf(str[end - 1]) >= 0)
                --end;

            return (start > 0 || end < str.length) ? str.substring(start, end) : str;
        }

        async filter(days, tags, terms) {
            //days supercedes everything
            //if days are provided get queries by days first
            //then filter by terms and tags if provided
            this.logger.log(TAG$o, `filter: days ${JSON.stringify(days)} tags ${tags} terms ${terms}`);

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
                this.logger.log(TAG$o, 'filtering');
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
            this.logger.log(TAG$o, `${ids}`);
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
                this.logger.log(TAG$o, `s: ${s} e: ${e}`);

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
                        this.logger.log(TAG$o, `id: ${cursor.value.created_at.toISOString()}`);
                        queries.push(cursor.value.id);
                        cursor.continue();
                    } else {
                        resolve(queries);
                    }
                };
            });
        }
    }

    const TAG$n = "base-meta-db";
    const ID = 1;

    class BaseMetaDB extends BaseDB {
        async getDb() {
            let rec = await super.get(parseInt(ID));
            if (rec == null) {
                return '';
            }

            return rec.db ?? '';
        }

        async setDb(db) {
            this.logger.log(TAG$n, "setDb");
            let rec = await super.get(parseInt(ID));

            if (rec == null) {
                await this.save(this.store, {
                    id: parseInt(ID),
                    db: db
                });
                return;
            }

            rec.db = db;
            await this.put(this.store, rec);
        }

        async getLastSyncTs() {
            let rec = await super.get(parseInt(ID));
            if (rec == null) {
                return new Date(Constants.EPOCH_TIMESTAMP);
            }

            return rec.last_sync_ts ?? new Date(Constants.EPOCH_TIMESTAMP);
        }

        async setLastSyncTs() {
            let rec = await super.get(parseInt(ID));

            if (rec == null) {
                await super.save(this.store, {
                    id: parseInt(ID),
                    last_sync_ts: new Date()
                });
                return;
            }

            rec.last_sync_ts = new Date();
            await super.put(this.store, rec);
        }

        async get() {
            return await super.get(parseInt(ID));
        }

        async destroy() {
            return await super.destroy(parseInt(ID));
        }
    }

    const TAG$m = "queries-meta-db";

    class QueriesMetaDB extends BaseMetaDB {
        constructor(logger, options) {
            options.dbName = "queries_meta";
            super(logger, options);
            this.logger = logger;
            this.store = "queries_meta";
        }

        onUpgrade(e) {
            this.logger.log(TAG$m, `onUpgrade: o: ${e.oldVersion} n: ${e.newVersion}`);
            if (e.oldVersion < 1) {
                e.target.result.createObjectStore(
                    this.store, { keyPath: 'id', autoIncrement: true });
            }
        }
    }

    const TAG$l = "connection-db";
    const CONNECTION_INDEX = "connection-index";
    const DB_NAME = "connections";

    class ConnectionDB extends BaseDB {
        constructor(logger, options) {
            options.dbName = DB_NAME;
            super(logger, options);
            this.logger = logger;
            this.store = "connections";
        }

        onUpgrade(e) {
            this.logger.log(TAG$l, `open.onupgradeneeded: ${e.oldVersion}`);
            if (e.oldVersion < 1) {
                let store = e.currentTarget.result.createObjectStore(
                    this.store, { keyPath: 'id', autoIncrement: true });
                store.createIndex(CONNECTION_INDEX, ["name", "user", "pass", "port", "db"], { unique: true });
            }

            if (e.oldVersion < 2) {
                let store = e.currentTarget.transaction.objectStore(this.store);
                store.createIndex(Constants.DB_ID_INDEX, ["id", "db_id"], {unique: true});
            }

            if (e.oldVersion < 3) {
                let store = e.currentTarget.transaction.objectStore(this.store);
                store.deleteIndex(CONNECTION_INDEX);
                store.deleteIndex(Constants.DB_ID_INDEX);

                store.createIndex(CONNECTION_INDEX, ["name", "user", "port", "db"], { unique: true });
                store.createIndex(Constants.DB_ID_INDEX, ["db_id"], {unique: true});
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
                this.logger.log(TAG$l, e.message);
            }
        }

        async put(id, password, isDefault) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store, "readwrite");
                let objectStore = transaction.objectStore(this.store);
                let request = objectStore.get(id);

                request.onsuccess = (e) => {
                    let o = e.target.result;

                    if (password) {
                        o.pass = password;
                    }

                    if (o.is_default != isDefault) {
                        //we set updated at only if is_default has changed. We don't
                        //care about password change
                        o.updated_at = new Date();
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
    }

    const TAG$k = "connections-meta-db";

    class ConnectionsMetaDB extends BaseMetaDB {
        constructor(logger, options) {
            options.dbName = "connections_meta";
            super(logger, options);
            this.logger = logger;
            this.store = "connections_meta";
        }

        onUpgrade(e) {
            this.logger.log(TAG$k, `onUpgrade: o: ${e.oldVersion} n: ${e.newVersion}`);
            if (e.oldVersion < 1) {
                e.target.result.createObjectStore(
                    this.store, { keyPath: 'id', autoIncrement: true });
            }
        }
    }

    const TAG$j = "utils";
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

        static async get(url, handleError = true, headers = {}) {
            try {
                let hdrs = {
                    'X-Request-ID': Utils.uuid()
                };
                hdrs = {...hdrs, ...headers};
                let response = await fetch(url, {
                    headers: hdrs
                });

                let json = await response.json();
                Logger.Log(TAG$j, JSON.stringify(json));

                if (json.status == 'error') {
                    throw json
                }

                return json
            } catch (e) {
                Logger.Log(TAG$j, JSON.stringify(e));
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
                    window.location = '/connections';
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

        static async post(url, body, handleError = true, headers = {}) {
            try {
                let hdrs = {
                    'X-Request-ID': Utils.uuid()
                };
                hdrs = {...hdrs, ...headers};
                let formData = new FormData();

                for (let k in body) {
                    formData.append(k, body[k]);
                }

                let response = await fetch(url, {
                    headers: hdrs,
                    body: formData,
                    method: "post"
                });

                let json = await response.json();
                Logger.Log(TAG$j, JSON.stringify(json));

                if (json.status == 'error') {
                    throw json
                }

                return json
            } catch (e) {
                Logger.Log(TAG$j, JSON.stringify(e));
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
                if (res.msg == Err.ERR_SIGNIN_REQUIRED) {
                    window.location = '/signin';
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
            Logger.Log(TAG$j, "No data");
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

        static isEmpty(obj) { 
            for (var x in obj) {
                return false; 
            }
            return true;
        }

        static async resetAll() {
            let connDb = new ConnectionDB(new Logger(), {version: Constants.CONN_DB_VERSION});
            await connDb.open();
            let conns = await connDb.getAll();
            Logger.Log(TAG$j, "Resetting connections..");
            for (let i = 0; i < conns.length; i++) {
                await connDb.reset(conns[i]);
            }
            Logger.Log(TAG$j, "Done.");

            let queryDb = new QueryDB(new Logger(), {version: Constants.QUERY_DB_VERSION});
            await queryDb.open();
            let queries = await queryDb.getAll();
            Logger.Log(TAG$j, "Resetting queries..");
            for (let i = 0; i < queries.length; i++) {
                await queryDb.reset(queries[i]);
            }
            Logger.Log(TAG$j, "Done.");

            Logger.Log(TAG$j, "Resetting QueriesMetaDB");
            let queriesMetaDb = new QueriesMetaDB(new Logger(), {version: Constants.QUERIES_META_DB_VERSION});
            await queriesMetaDb.open();
            await queriesMetaDb.destroy();
            Logger.Log(TAG$j, "Done.");

            Logger.Log(TAG$j, "Resetting connectionsMetaDb");
            let connectionsMetaDb = new ConnectionsMetaDB(new Logger(), {version: Constants.CONNECTIONS_META_DB_VERSION});
            await connectionsMetaDb.open();
            await connectionsMetaDb.destroy();
            Logger.Log(TAG$j, "Done.");
        }

        static async delay(t) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, t);
            });
        }

        static getTerms(query) {
            let terms = [];
            let tokens = sqlFormatter.format(query, {language: "mysql"}).tokens;
            //select only reserved*, string and number
            tokens.forEach((t) => {
                if (t.type == "string") {
                    terms.push(t.value);
                    return;
                }

                if (t.type == "number") {
                    terms.push(t.value);
                    return;
                }

                if (/^reserved/.test(t.type)) {
                    terms.push(t.value);
                    return;
                }
            });
            return terms;
        }
    }

    const TAG$i = "stream";

    class Stream {
        constructor(url) {
            this.promises = [];
            this.registered = false;

            this.ws = new WebSocket(url);

            this.ws.onerror = (evt) => {
                Logger.Log(TAG$i, "onerror:" + evt);
                this.rej(Err.ERR_NO_AGENT);
            };

            this.ws.onclose = (evt) => {
                Logger.Log(TAG$i, "onclose");
                this.ws = null;
            };
        }

        get() {
            return new Promise((res, rej) => {
                if (!this.registered) {
                    this.ws.onmessage = (evt) => {
                        let res = this.promises.shift();
                        let json = JSON.parse(evt.data);
                        if (json.status == "error") {
                            this.rej(json.msg);
                            return;
                        }
                        res(json['k']);
                    };
                    this.registered = true;
                }

                this.promises.push(res);
                this.rej = rej;
            })
        }
    }

    let subscribers = {};

    class PubSub {
        static subscribe(evt, cb) {
            if (!subscribers[evt]) {
                subscribers[evt] = new Set();
            }
            subscribers[evt].add(cb);
        }

        static publish(evt, data) {
            let list = subscribers[evt];
            if (!list) {
                return;
            }
            for (let s of list) {
                s(data);
            }
        }
    }

    class ProgressBar {
        constructor(options = {}) {
    		document.addEventListener("DOMContentLoaded", () => {
    			this.progressBar = document.getElementById('progress-bar-no-buttons');
    			this.message = this.progressBar.querySelector('.message');
    			this.time = this.progressBar.querySelector('.time');
    			this.hasButtons = false;
    		});

            //todo: why can't we have simple function calls?
            PubSub.subscribe(Constants.INIT_PROGRESS, (data) => {
                this.time.innerHTML = '';
                this.message.innerHTML = '';
                this.elapsed = 0;

                if (this.hasButtons) {
                    this.title.innerHTML = data.title;
                }

                this.message.innerHTML = data.message;

                this.timer = setInterval(() => {
                    this.elapsed++;
                    this.time.innerHTML = this.elapsed + ' s';
                }, 1000);

                this.progressBar.classList.add('is-active');
            });

            PubSub.subscribe(Constants.START_PROGRESS, (data) => {
                this.time.innerHTML = '';
                this.message.innerHTML = '';
                this.elapsed = 0;

                if (this.hasButtons) {
                    this.title.innerHTML = data.title;
                }
            });

            PubSub.subscribe(Constants.STOP_PROGRESS, () => {
                clearInterval(this.timer);

                //if we have buttons, wait till user clicks ok
                if (this.ok) {
                    this.ok.disabled = false;
                    this.cancel.disabled = true;
                    return
                }

                //otherwise close ourselves immediately
                this.progressBar.classList.remove('is-active');
            });

            PubSub.subscribe(Constants.UPDATE_PROGRESS, (data) => {
                this.message.innerHTML = data.message;
            });
        }

        setOptions(options) {
            if (options.buttons) {
                this.progressBar = document.getElementById('progress-bar-with-buttons');
                this.title = this.progressBar.querySelector('.modal-card-title');
                this.ok = this.progressBar.querySelector('.ok');
                this.cancel = this.progressBar.querySelector('.cancel');
                this.cancelFunc = options.cancel;

                this.ok.disabled = true;
                this.cancel.disabled = false;

                this.ok.addEventListener('click', () => {
                    this.progressBar.classList.remove('is-active');
                });

                this.cancel.addEventListener('click', () => {
                    this.cancelFunc();
                    this.progressBar.classList.remove('is-active');
                });

                this.hasButtons = true;

            } else {
                this.ok = null;
                this.cancel = null;
                this.cancelFunc = null;
                this.progressBar = document.getElementById('progress-bar-no-buttons');
                this.hasButtons = false;
            }

            this.message = this.progressBar.querySelector('.message');
            this.time = this.progressBar.querySelector('.time');
        }
    }

    let progressBar = new ProgressBar();

    const TAG$h = "dbutils";
    class DbUtils {

        //todo: use WS in fetchall and get rid of fetch route from agent
        static async fetchAll(sessionId, query, handleError = false) {
            let params = {
                'session-id': sessionId,
                query: query
            };

            let json = await Utils.get(Constants.URL + '/query?' + new URLSearchParams(params), handleError);
            Logger.Log(TAG$h, JSON.stringify(json));
            if (json.status == 'error') {
                Logger.Log(TAG$h, JSON.stringify(json));
                throw json.msg
            }

            let cursorId = json.data['cursor-id'];

            params = {
                'session-id': sessionId,
                'cursor-id': cursorId,
                'num-of-rows': Constants.BATCH_SIZE
            };

            let eof = false;
            let rows = [];

            do {
                json = await Utils.get(Constants.URL + '/fetch?' + new URLSearchParams(params), handleError);
                if (json.status == "error") {
                    Logger.Log(TAG$h, JSON.stringify(json));
                    throw json.msg
                }

                Logger.Log(TAG$h, JSON.stringify(json));
                if (!json.data) {
                    //if batch size == num of rows in query result, then we might get json.data = null
                    //but we should still return results fetched till this point
                    return rows
                }
                rows = rows.concat(json.data);
                eof = json.eof;
            } while (!eof)

            return rows
        }

        static async login(creds) {
            let json = await Utils.get(Constants.URL + '/login?' + new URLSearchParams(creds));
            if (json.status == 'error') {
                Logger.Log(TAG$h, JSON.stringify(json));
                return ""
            }

            return json.data['session-id']
        }

        async execute(query) {
            this.cursorId = await DbUtils.fetchCursorId(this.sessionId, query, true);

            let params = {
                'session-id': this.sessionId,
                'cursor-id': this.cursorId,
                'num-of-rows': -1,//not used
            };

            return await Utils.get(Constants.URL + '/fetch?' + new URLSearchParams(params));
        }

        static async cancel(sessionId, cursorId) {
            let params = {
                'session-id': sessionId,
                'cursor-id': cursorId,
            };

            await Utils.get(Constants.URL + '/cancel?' + new URLSearchParams(params));
        }

        static async fetchCursorId(sessionId, query, execute = false) {
            let q = encodeURIComponent(query);
            let params = {
                'session-id': sessionId,
                query: q
            };

            if (execute) {
                let json = await Utils.get(Constants.URL + '/execute?' + new URLSearchParams(params));
                return json.data['cursor-id']
            }

            let json = await Utils.get(Constants.URL + '/query?' + new URLSearchParams(params));
            return json.data['cursor-id']
        }

        async exportResults(q) {
            let cursorId = await DbUtils.fetchCursorId(this.sessionId, q);
            Logger.Log(TAG$h, `cursorId: ${cursorId}`);
            let params = {
                'session-id': this.sessionId,
                'cursor-id': cursorId,
                'req-id': Utils.uuid(),
                'num-of-rows': -1,
                'export': true
            };

            let stream = new Stream(Constants.WS_URL + '/fetch_ws?' + new URLSearchParams(params));

            progressBar.setOptions({
                buttons: true,
                cancel: () => {
                    DbUtils.cancel(this.sessionId, cursorId);
                    Logger.Log(TAG$h, `Cancelled ${cursorId}`);
                }
            });

            PubSub.publish(Constants.INIT_PROGRESS, {
                title: `Running query`,
                message: `Please wait`
            });
            let fileName = '';
            let n = 0;
            let err = Err.ERR_NONE;

            while (true) {
                let row;
                try {
                    row = await stream.get();
                } catch (e) {
                    PubSub.publish(Constants.STREAM_ERROR, {
                        'error': e
                    });
                    err = e;
                    break;
                }

                if (row.length == 1 && row[0] == "eos") {
                    break;
                }

                if (row[0] == "header") {
                    fileName = row[2];

                    PubSub.publish(Constants.START_PROGRESS, {
                        title: `Exporting to ${fileName}`
                    });

                    //If we are here query was OK, save to DB
                    PubSub.publish(Constants.QUERY_DISPATCHED, {
                        query: q,
                        tags: [Constants.USER]
                    });
                    continue;
                }

                if (row[0] == "current-row") {
                    n += row[1];

                    PubSub.publish(Constants.UPDATE_PROGRESS, {
                        message: `Processed ${row[1]} rows`
                    });
                }
            }

            if (n > 0) {
                PubSub.publish(Constants.UPDATE_PROGRESS, {
                    message: `Export complete`
                });
            } else {
                PubSub.publish(Constants.START_PROGRESS, {
                    title: `No data`
                });

                PubSub.publish(Constants.UPDATE_PROGRESS, {
                    message: `Processed 0 rows`
                });
            }

            PubSub.publish(Constants.STOP_PROGRESS, {});

            if (err == Err.ERR_NONE) {
                return {
                    'status': "ok",
                    'rows-affected': n
                }
            }

            return {
                'status': "error",
                'msg': err
            }
        }

        static createFKMap(constraints) {
            Logger.Log(TAG$h, JSON.stringify(constraints));
            let fkMap = {};

            if (constraints.length == 0) {
                return fkMap;
            }

            let colIndex, refTblIndex, refColIndex, constraintNameIndex;

            //first get indexes of columns of interest
            let i = 0;
            constraints[0].forEach((c) => {
                switch (c) {
                    case 'CONSTRAINT_NAME':
                        constraintNameIndex = (i + 1);
                        break

                    case 'COLUMN_NAME':
                        colIndex = (i + 1);
                        break

                    case 'REFERENCED_TABLE_NAME':
                        refTblIndex = (i + 1);
                        break;

                    case 'REFERENCED_COLUMN_NAME':
                        refColIndex = (i + 1);
                        break;
                }
                i++;
            });

            //Now get values of columns for each row
            constraints.forEach((row) => {
                if (row[refTblIndex] != "NULL") {
                    fkMap[row[colIndex]] = {
                        'ref-table': row[refTblIndex],
                        'ref-column': row[refColIndex],
                    };
                }

                if (row[constraintNameIndex] == 'PRIMARY') {
                    fkMap['primary-key'] = row[colIndex];
                }
            });

            return fkMap
        }

        static getLimit(page, delta) {
            return `${(page + delta) * Constants.BATCH_SIZE_WS}, ${Constants.BATCH_SIZE_WS}`;
        }

        static getOrder(col, order) {
            if (!order) {
                return '';
            }
            return ` order by \`${col}\` ${order}`;
        }
    }

    const TAG$g = "grid-resizer";
    class GridResizerH {
        //resize two elements contained in grid horizontal direction
        constructor($grid, $e1, $resizer, $e2) {
            this.d1 = $e1.getBoundingClientRect().width;
            this.d2 = $e2.getBoundingClientRect().width;

            Logger.Log(TAG$g, `${this.d1} ${this.d2}`);

            $resizer.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                this.startx = e.clientX;
                Logger.Log(TAG$g, `mousedown: ${e.clientX}`);
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!this.isDragging) {
                    return;
                }
                Logger.Log(TAG$g, `mousemove: ${e.clientX}`);
                let delta = e.clientX - this.startx;
                this.d1 += delta;
                this.d2 += -1 * delta;
                Logger.Log(TAG$g, `${delta} ${this.d1} ${this.d2}`);

                $grid.style.gridTemplateColumns = `${this.d1}px 1px ${this.d2}px`;
                this.startx = e.clientX;
                e.preventDefault();
            });

            document.addEventListener('mouseup', (e) => {
                this.isDragging = false;
                Logger.Log(TAG$g, `mouseup: ${e.clientX}`);
                e.preventDefault();
                PubSub.publish(Constants.GRID_H_RESIZED, {});
            });
        }
    }

    class AgGrid {
        static init() {
            return new Promise((resolve, reject) => {
                let script = document.createElement('script');
                script.src = 'https://unpkg.com/ag-grid-community/dist/ag-grid-community.min.noStyle.js';
                document.head.appendChild(script);

    			let link = document.createElement("link");
    			link.href = "https://unpkg.com/ag-grid-community/dist/styles/ag-grid.css";
    			link.type = "text/css";
    			link.rel = "stylesheet";
    			document.getElementsByTagName("head")[0].appendChild(link);

    			link = document.createElement("link");
    			link.href = "https://unpkg.com/ag-grid-community/dist/styles/ag-theme-alpine.css";
    			link.type = "text/css";
    			link.rel = "stylesheet";
    			document.getElementsByTagName("head")[0].appendChild(link);

    			script.onload = () => {
    				resolve(agGrid.Grid);
    			};
    		});
    	}
    }

    const TAG$f = 'cell-renderer';

    class CellRenderer {
    	constructor(fkMap) {
            this.fkMap = fkMap;
            this.fkCellTemplate = document.getElementById('fk-cell-template').innerHTML;
            this.cellTemplate = document.getElementById('cell-template').innerHTML;
        }

        render(params) {
            Logger.Log(TAG$f, `${params.colDef.field}`);
            let id = params.colDef.colId;
            let c = params.colDef.field;
            let v = params.data[`${c}-${id}`];

            let refTable = '';
            let refColumn = '';

            if (this.fkMap[c] && v != "NULL") {
                refTable = this.fkMap[c]['ref-table'];
                refColumn = this.fkMap[c]['ref-column'];
            }

            let cls = (v == "NULL") ? "null" : "";

            if (refTable) {
                return Utils.generateNode(this.fkCellTemplate, {
                    'value': v,
                    'table': refTable,
                    'column': refColumn,
                });
            }

            return Utils.generateNode(this.cellTemplate, {
                'value': v,
                'cls': cls
            })
        }
    }

    class CellHeader {
        init(params) {
            this.params = params;
            //todo: Using generateNode causes lot of error in console
            this.$header = document.createElement('div');
            this.$header.innerHTML = `
           <div class="customHeaderLabel">${this.params.displayName}</div>
           <div class="customSortDownLabel inactive">
               <i class="fa fa-long-arrow-alt-down"></i>
           </div>
           <div class="customSortUpLabel inactive">
               <i class="fa fa-long-arrow-alt-up"></i>
           </div>
           <div class="customSortRemoveLabel inactive">
               <i class="fa fa-times"></i>
           </div>
       `;

            this.$sortDown = this.$header.querySelector(".customSortDownLabel");
            this.$sortUp = this.$header.querySelector(".customSortUpLabel");
            this.$sortRemove = this.$header.querySelector(".customSortRemoveLabel");

            if (this.params.enableSorting) {
                this.onSortAscRequestedListener = this.onSortRequested.bind(this, 'asc');
                this.$sortDown.addEventListener('click', this.onSortAscRequestedListener);
                this.onSortDescRequestedListener = this.onSortRequested.bind(this, 'desc');
                this.$sortUp.addEventListener('click', this.onSortDescRequestedListener);
                this.onRemoveSortListener = this.onSortRequested.bind(this, '');
                this.$sortRemove.addEventListener('click', this.onRemoveSortListener);

                this.onSortChangedListener = this.onSortChanged.bind(this);
                this.params.column.addEventListener('sortChanged', this.onSortChangedListener);
                this.onSortChanged();
            } else {
                this.$header.removeChild(this.$sortDown);
                this.$header.removeChild(this.$sortUp);
                this.$header.removeChild(this.$sortRemove);
            }
        }

        onSortChanged(order) {
            const deactivate = toDeactivateItems => {
                toDeactivateItems.forEach(toDeactivate => {
                    toDeactivate.className = toDeactivate.className.split(' ')[0];
                });
            };

            const activate = toActivate => {
                toActivate.className = toActivate.className + " sort-active";
            };

            if (order == 'asc') {
                deactivate([this.$sortUp, this.$sortRemove]);
                activate(this.$sortDown);
            } else if (order == 'desc') {
                deactivate([this.$sortDown, this.$sortRemove]);
                activate(this.$sortUp);
            } else {
                deactivate([this.$sortUp, this.$sortDown]);
                activate(this.$sortRemove);
            }
        }

        getGui() {
            return this.$header;
        }

        onSortRequested(order, event) {
            PubSub.publish(Constants.SORT_REQUESTED, {
                column: this.params.column.colDef.field,
                order: order
            });

            //this.params.setSort(order, event.shiftKey);
            this.onSortChanged(order);
        }

        destroy() {
            this.$sortDown.removeEventListener('click', this.onSortRequestedListener);
            this.$sortUp.removeEventListener('click', this.onSortRequestedListener);
            this.$sortRemove.removeEventListener('click', this.onSortRequestedListener);
            this.params.column.removeEventListener('sortChanged', this.onSortChangedListener);
        } 
    }

    const TAG$e = 'cell-editor';

    class CellEditor {
       init(params) {
            let id = params.colDef.colId;
            let c = params.colDef.field;
            this.value = params.data[`${c}-${id}`];

           this.input = document.createElement('input');
           this.input.classList.add('input');
           this.input.id = 'input';
           this.input.value = this.value;

           this.input.addEventListener('input', (event) => {
               this.value = event.target.value;
               Logger.Log(TAG$e, "listener:" + this.value);
           });
       }

       /* Component Editor Lifecycle methods */
       // gets called once when grid ready to insert the element
       getGui() {
           return this.input;
       }

       // the final value to send to the grid, on completion of editing
       getValue() {
           // this simple editor doubles any value entered into the input
           Logger.Log(TAG$e, "getvalue:" + this.value);
           return this.input.value;
       }

       // Gets called once before editing starts, to give editor a chance to
       // cancel the editing before it even starts.
       isCancelBeforeStart() {
           return false;
       }

       // Gets called once when editing is finished (eg if Enter is pressed).
       // If you return true, then the result of the edit will be ignored.
       isCancelAfterEnd() {
           // our editor will reject any value greater than 1000
           return false;
       }

       // after this component has been created and inserted into the grid
       afterGuiAttached() {
           this.input.focus();
       }
    }

    const TAG$d = "table-utils";

    class TableUtils {
        constructor($root) {
            this.$root = $root;
            this.$loaderTemplate = document.getElementById('table-loader-template').innerHTML;
            this.init();

            document.addEventListener('click', (e) => {
                let p = e.target.parentElement;
                if (p.id != 'cancel-query') {
                    return;
                }

                Logger.Log(TAG$d, "Cancel clicked");
                PubSub.publish(Constants.QUERY_CANCELLED, {});
            });
        }

        async init() {
    		await AgGrid.init();
        }

        async showContents(stream, fkMap, selection = {}, editable = false, sortable = false) {
            this.fkMap = fkMap;
            let grid = this.createGrid();
            this.showLoader();

            let i = 0;
            let err = Err.ERR_NONE;
            let s = Date.now();

            while (true) {
                let row;
                try {
                    row = await stream.get();
                } catch (e) {
                    PubSub.publish(Constants.STREAM_ERROR, {
                        'error': e
                    });
                    err = e;
                    break;
                }

                if (row.length == 1 && row[0] == "eos") {
                    break;
                }

                if (i == 0) {
                    //measure time to receive first row
                    this.setupGrid(grid, row, fkMap, selection, editable, sortable);
                }

                let item = {};
                let k = 0;
                for (let j = 0; j < row.length; j += 2) {
                    //We append an index to each column name. This makes is possible to 
                    //display columns with same name. Refer cell renderer
                    item[`${row[j]}-${k}`] = row[j + 1];
                    k++;
                }

                this.api.applyTransactionAsync({ add: [item] });
                i++;
            }

            this.hideLoader();

            if (i == 0) {
                let gridOptions = {};

                new agGrid.Grid(grid, gridOptions);
                this.api = gridOptions.api;
                this.api.showNoRowsOverlay();
            }

            this.numOfRows = i;

            if (err == Err.ERR_NONE) {
                let e = Date.now();
                return {
                    'status': "ok",
                    'rows-affected': this.numOfRows,
                    'time-taken': (e - s)
                }
            }

            return {
                'status': "error",
                'msg': err
            }
        }

        createGrid() {
            //add grid div
            let grid = this.$root.querySelector('#grid');
            //clear existing grid if any
            if (grid != null) {
                grid.remove();
            }

            let n = Utils.generateNode('<div id="grid" class="ag-theme-alpine"></div>', {});
            this.$root.append(n);
            return this.$root.querySelector('#grid');
        }

        setupGrid(grid, row, fkMap, selection, editable, sortable) {
            let cols = this.setupColumns(row, fkMap, selection, editable);
            let gridOptions = {
                columnDefs: cols,
                undoRedoCellEditing: true,
                rowSelection: 'single',
                onSelectionChanged: () => {
                    this.onSelectionChanged(fkMap);
                }
            };

            if (sortable) {
                gridOptions.components = {
                    agColumnHeader: CellHeader,
                };
            }

            new agGrid.Grid(grid, gridOptions);
            this.gridOptions = gridOptions;
            this.api = gridOptions.api;
            this.api.hideOverlay();
        }

        onSelectionChanged(fkMap) {
            if (Utils.isEmpty(fkMap)) {
                return;
            }

            const selectedRows = this.gridOptions.api.getSelectedRows();
            Logger.Log(TAG$d, "fkMap:" + JSON.stringify(fkMap));
            Logger.Log(TAG$d, "onSelectionChanged:" + JSON.stringify(selectedRows));
            for (let k in selectedRows[0]) {
                if (k == fkMap['primary-key'] + '-' + fkMap['primary-key-id']) {
                    PubSub.publish(Constants.ROW_SELECTED, {
                        'key': fkMap['primary-key'],
                        'value': selectedRows[0][k]
                    });
                    break;
                }
            }
        }

        setupColumns(row, fkMap, selection, editable ) {
            let cols = [];
            let cellRenderer = new CellRenderer(fkMap);
            //using colId makes it possible to display multiple columns with 
            //same name
            let k = 0;
            for (let j = 0; j < row.length; j += 2) {

                let show = selection[k] ?? true;
                if (row[j] == fkMap['primary-key']) {
                    fkMap['primary-key-id'] = k;
                }
                cols.push({
                    field: row[j],
                    colId: k++,
                    hide: !show,
                    resizable: true,
                    editable: editable,
                    sortable: true,
                    onCellValueChanged: (params) => {
                        this.handleCellValueChanged(fkMap, params);
                    },
                    cellRenderer: (params) => {
                        return cellRenderer.render(params)
                    },
                    cellEditor: CellEditor,
                    valueGetter: params => {
                        Logger.Log(TAG$d, "valueGetter");
                        let id = params.colDef.colId;
                        let c = params.colDef.field;
                        return params.data[`${c}-${id}`];
                    },
                    valueSetter: params => {
                        Logger.Log(TAG$d, "valueSetter");
                        let id = params.colDef.colId;
                        let c = params.colDef.field;
                        params.data[`${c}-${id}`] = params.newValue;
                        return true;
                    }
                });
            }

            return cols;
        }

        async update(stream) {
            let s = Date.now();
            //remove existing rows
            let rows = [];
            for (let i = 0; i < this.numOfRows; i++) {
                let n = this.api.rowModel.rowsToDisplay[i].data;
                rows.push(n);
            }

            this.api.applyTransactionAsync({ remove: rows });

            //start adding new rows
            this.showLoader();

            let err = Err.ERR_NONE;
            let i = 0;

            while (true) {
                let row;
                try {
                    row = await stream.get();
                } catch (e) {
                    PubSub.publish(Constants.STREAM_ERROR, {
                        'error': e
                    });
                    err = e;
                    break;
                }

                if (row.length == 1 && row[0] == "eos") {
                    break;
                }

                let item = {};
                let k = 0;
                for (let j = 0; j < row.length; j += 2) {
                    item[`${row[j]}-${k}`] = row[j + 1];
                    k++;
                }

                this.api.applyTransactionAsync({ add: [item] });
                i++;
            }

            this.numOfRows = i;

            this.hideLoader();

            if (err == Err.ERR_NONE) {
                let e = Date.now();
                return {
                    'status': "ok",
                    'rows-affected': this.numOfRows,
                    'time-taken': (e - s)
                }
            }

            return {
                'status': "error",
                'msg': err
            }
        }

        undo() {
            this.undoStarted = true;
            this.api.undoCellEditing();
        }

        selectColumns(selection) {
            for (let col in selection) {
                this.gridOptions.columnApi.setColumnVisible(col, selection[col]);
            }
        }

        handleCellValueChanged(fkMap, params) {
            if (this.undoStarted) {
                //handleCellValueChanged will be called even after undo.
                //At that time we don't want to trigger cell_edited event
                this.undoStarted = false;
                return;
            }
            Logger.Log(TAG$d, "handleCellValueChanged");
            let key = fkMap['primary-key'];

            let keyId = fkMap['primary-key-id'];
            let keyValue = params.data[`${key}-${keyId}`];

            let colId = params.colDef.colId;
            let colField = params.colDef.field;
            let colValue = params.data[`${colField}-${colId}`];

            PubSub.publish(Constants.CELL_EDITED, {
                key: {
                    'name': key,
                    'value': keyValue,
                },
                col: {
                    'name': colField,
                    'value': colValue
                },
                cell: {
                    rowIndex: params.node.rowIndex,
                    colId: params.colDef.colId
                }
            });
        }

        showLoader() {
            //todo:this is very hackish. Must be accomplished with CSS alone
            let n = Utils.generateNode(this.$loaderTemplate, {});
            document.querySelector('body').append(n);
            let loader = document.querySelector('.table-loader');
            let dims = this.$root.getBoundingClientRect();
            loader.style.width = dims.width + 'px';
            loader.style.height = dims.height + 'px';
            loader.style.left = dims.left + 'px';
            loader.style.top = dims.top + 'px';
            let spinner = loader.querySelector('button');
            spinner.style.left = (dims.width / 2) + 'px';
            spinner.style.top = (dims.height / 4) + 'px';
        }

        hideLoader() {
            let loader = document.querySelector('.table-loader');
            loader.remove();
        }

        clearInfo() {
            this.$timeTaken.innerText = '';
            this.$rowsAffected.innerText = '';
        }

        showInfo(t, n) {
            let rows = (n == 1) ? 'row' : 'rows';
            this.$timeTaken.innerText = `${t} ms`;
            this.$rowsAffected.innerText = `${n} ${rows} affected`;
        }
    }

    const TAG$c = "grid-resizer";
    class GridResizerV {
        //resize two elements contained in grid horizontal direction
        constructor($grid, $e1, $resizer, $e2) {
            this.d1 = $e1.getBoundingClientRect().height;
            this.d2 = $e2.getBoundingClientRect().height;

            Logger.Log(TAG$c, `${this.d1} ${this.d2}`);

            $resizer.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                this.starty = e.clientY;
                Logger.Log(TAG$c, `mousedown: ${e.clientY}`);
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!this.isDragging) {
                    return;
                }
                Logger.Log(TAG$c, `mousemove: ${e.clientY}`);
                let delta = e.clientY - this.starty;
                this.d1 += delta;
                this.d2 += -1 * delta;
                Logger.Log(TAG$c, `${delta} ${this.d1} ${this.d2}`);

                $grid.style.gridTemplateRows = `${this.d1}px 1px ${this.d2}px`;
                this.starty = e.clientY;
                e.preventDefault();
            });

            document.addEventListener('mouseup', (e) => {
                this.isDragging = false;
                Logger.Log(TAG$c, `mouseup: ${e.clientY}`);
                e.preventDefault();
            });
        }
    }

    /*Copyright 2017 Kenneth Jiang

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE*/

    //https://github.com/kennethjiang/js-file-download/blob/master/file-download.js

    class FileDownloader {
    	static download(data, filename, mime, bom) {
    		var blobData = (typeof bom !== 'undefined') ? [bom, data] : [data];
    		var blob = new Blob(blobData, {type: mime || 'application/octet-stream'});
    		if (typeof window.navigator.msSaveBlob !== 'undefined') {
    			// IE workaround for "HTML7007: One or more blob URLs were
    			// revoked by closing the blob for which they were created.
    			// These URLs will no longer resolve as the data backing
    			// the URL has been freed."
    			window.navigator.msSaveBlob(blob, filename);
    		}
    		else {
    			var blobURL = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
    			var tempLink = document.createElement('a');
    			tempLink.style.display = 'none';
    			tempLink.href = blobURL;
    			tempLink.setAttribute('download', filename);

    			// Safari thinks _blank anchor are pop ups. We only want to set _blank
    			// target if the browser does not support the HTML5 download attribute.
    			// This allows you to download files in desktop safari if pop up blocking
    			// is enabled.
    			if (typeof tempLink.download === 'undefined') {
    				tempLink.setAttribute('target', '_blank');
    			}

    			document.body.appendChild(tempLink);
    			tempLink.click();

    			// Fixes "webkit blob resource error 1"
    			setTimeout(function() {
    				document.body.removeChild(tempLink);
    				window.URL.revokeObjectURL(blobURL);
    			}, 200);
    		}
    	}
    }

    const TAG$b = 'ace';
    const MAX_COL = 100000;

    class Ace {
        constructor(elemId) {
            this.elemId = elemId;
        }

        init() {
            return new Promise((resolve, reject) => {
                let script = document.createElement('script');
                script.src = '/ace-builds/src-min/ace.js';
                document.head.appendChild(script);

                script.onload = () => {
                    this.editor = ace.edit(this.elemId);
                    this.range = ace.require('ace/range').Range;

                    this.editor.setTheme("ace/theme/github");
                    this.editor.session.setMode("ace/mode/mysql");
                    this.editor.setHighlightActiveLine(false);

                    this.editor.textInput.getElement().addEventListener('keyup', () => {
                        this.onKeyup();
                    });

                    this.editor.on('dblclick', (e) => {
                        Logger.Log(TAG$b, 'dblclick');
                        this.onKeyup();
                    });

                    this.editor.on('mousedown', (e) => {
                        Logger.Log(TAG$b, 'mousedown');
                        setTimeout(() => {
                            this.onKeyup();
                        }, 5);
                    });

                    this.setKeyBindings();

                    resolve();
                };
            });
        }

        resize() {
            this.editor.resize();
        }

        setValue(v) {
            if (!this.selRange) {
                this.editor.setValue(v);
                return;
            }
            this.editor.session.replace(this.selRange, v + ";");

            this.editor.$search.setOptions({
                needle: ';',
                backwards: true,
                preventScroll: true,
            });

            let cursor = this.editor.selection.getCursor();
            this.editor.moveCursorTo(cursor.row, cursor.column - 1);

            //and highlight it
            this.onKeyup();
        }

        clearSelection() {
            this.editor.clearSelection();
        }

        focus() {
            this.editor.focus();
        }

        getValue() {
            if (!this.selRange) {
                return this.editor.getValue();
            }

            let v = this.editor.session.getTextRange(this.selRange);
            return this.cleanup(v);
        }

        getAll() {
            return this.editor.getValue();
        }

        cleanup(str) {
            //remove spaces and ;
            let chars = [' ', ';'];
            let start = 0, 
                end = str.length;

            while(start < end && chars.indexOf(str[start]) >= 0)
                ++start;

            while(end > start && chars.indexOf(str[end - 1]) >= 0)
                --end;

            return (start > 0 || end < str.length) ? str.substring(start, end) : str;
        }

        onKeyup(e) {
            if (this.marker) {
                this.editor.session.removeMarker(this.marker);
            }

            let cursor = this.editor.selection.getCursor();
            Logger.Log(TAG$b, JSON.stringify(cursor));

            this.updateSelRange(cursor);
            if (this.selRange) {
                this.marker = this.editor.session.addMarker(this.selRange, "ace_active-line", "text");
            }
        }

        updateSelRange(cursor) {
            this.editor.$search.setOptions({
                needle: ';',
                backwards: true,
                preventScroll: true,
                wrap: true
            });

            let startRow = 0;
            let startColumn = 0;
            let endRow = (this.editor.session.getLength() - 1);
            let endColumn = MAX_COL;

            let ranges = this.editor.$search.findAll(this.editor.session);

            Logger.Log(TAG$b, JSON.stringify(ranges));
            if (ranges.length == 0) {
                this.selRange = null;
                return;
            }

            //determine start position of marker
            for (let i = 0; i < ranges.length; i++) {
                let r = ranges[i];
                //for start position , the range start MUST be <= cursor position
                if (r.start.row <= cursor.row) {
                    //if ; is on a previous line, definitely it should be considered
                    if (r.start.row < cursor.row) {
                        startRow = r.start.row;
                        startColumn = r.start.column;
                    }

                    //if ; is on the same line we can consider it only if its column is less than
                    //current cursor position
                    if (r.start.row == cursor.row) {
                        if (r.start.column < cursor.column) {
                            startRow = r.start.row;
                            startColumn = r.start.column;
                        }
                    }
                }
            }

            //determine end poisition of marker
            for (let i = 0; i < ranges.length; i++) {
                let r = ranges[i];

                if (r.start.row > cursor.row) {
                    endRow = r.end.row;
                    endColumn = r.end.column;
                    //ranges are ordered , so if we find a ; on next row, it must 
                    //be the closest one. There is nothing more to do
                    break;
                }

                if (r.start.row == cursor.row) {
                    if (r.start.column >= cursor.column) {
                        endRow = r.end.row;
                        endColumn = r.end.column;
                        break;
                    }
                }
            }

            //if there are no characters starting from startRange, shift to next row
            let check = this.editor.session.getTextRange(new this.range(startRow, startColumn, startRow, MAX_COL));
            check = this.cleanup(check);
            if (!check) {
                startRow++;
                startColumn = 0;
            } else {
                //shift to the first non white space character, unless its the start of the line
                if (startColumn > 0) {
                    startColumn++;
                }
            }

            Logger.Log(TAG$b, `sr ${startRow} sc ${startColumn} er ${endRow} ec ${endColumn}`);
            this.selRange = new this.range(startRow, startColumn, endRow, endColumn);
        }

        setKeyBindings() {
            this.editor.commands.addCommand({
                name: Constants.CMD_RUN_QUERY,
                bindKey: {
                    win: Constants.SHIFT_R,
                    mac: Constants.SHIFT_R,
                },
                exec: (editor) => {
                    PubSub.publish(Constants.CMD_RUN_QUERY, {});
                },
                readOnly: true // false if this command should not apply in readOnly mode
            });

            this.editor.commands.addCommand({
                name: Constants.CMD_NEXT_ROWS,
                bindKey: {
                    win: Constants.SHIFT_N,
                    mac: Constants.SHIFT_N,
                },
                exec: (editor) => {
                    PubSub.publish(Constants.CMD_NEXT_ROWS, {});
                },
                readOnly: true // false if this command should not apply in readOnly mode
            });

            this.editor.commands.addCommand({
                name: Constants.CMD_PREV_ROWS,
                bindKey: {
                    win: Constants.SHIFT_P,
                    mac: Constants.SHIFT_P,
                },
                exec: (editor) => {
                    PubSub.publish(Constants.CMD_PREV_ROWS, {});
                },
                readOnly: true // false if this command should not apply in readOnly mode
            });

            this.editor.commands.addCommand({
                name: Constants.CMD_EXPORT,
                bindKey: {
                    win: Constants.SHIFT_E,
                    mac: Constants.SHIFT_E,
                },
                exec: (editor) => {
                    PubSub.publish(Constants.CMD_EXPORT, {});
                },
                readOnly: true // false if this command should not apply in readOnly mode
            });

            this.editor.commands.addCommand({
                name: Constants.CMD_FORMAT_QUERY,
                bindKey: {
                    win: Constants.SHIFT_T,
                    mac: Constants.SHIFT_T
                },
                exec: (editor) => {
                    Logger.Log(TAG$b, "format");
                    PubSub.publish(Constants.CMD_FORMAT_QUERY, {});
                },
                readOnly: true // false if this command should not apply in readOnly mode
            });

            this.editor.commands.addCommand({
                name: Constants.CMD_RUN_ALL,
                bindKey: {
                    win: Constants.SHIFT_A,
                    mac: Constants.SHIFT_A
                },
                exec: (editor) => {
                    Logger.Log(TAG$b, "runall");
                    PubSub.publish(Constants.CMD_RUN_ALL, {});
                },
                readOnly: true // false if this command should not apply in readOnly mode
            });
        }
    }

    const TAG$a = "query-runner";

    class QueryRunner {
        constructor(sessionId) {

            this.sessionId = sessionId;
            Logger.Log(TAG$a, `sessionId: ${sessionId}`);
            this.init();

            PubSub.subscribe(Constants.STREAM_ERROR, (err) => {
                Logger.Log(TAG$a, `${Constants.STREAM_ERROR}: ${JSON.stringify(err)}`);
                Err.handle(err);
            });

            PubSub.subscribe(Constants.QUERY_CANCELLED, () => {
                DbUtils.cancel(this.sessionId, this.cursorId);
            });

            PubSub.subscribe(Constants.GRID_H_RESIZED, () => {
                this.editor.resize();
            });

            PubSub.subscribe(Constants.CELL_EDITED, async (data) => {
                this.tableUtils.undo();
            });

            //handle all keyboard shortcuts
            [
                Constants.CMD_RUN_QUERY,
                Constants.CMD_RUN_ALL,
                Constants.CMD_NEXT_ROWS,
                Constants.CMD_PREV_ROWS,
                Constants.CMD_EXPORT,
                Constants.CMD_FORMAT_QUERY,
            ].forEach((c) => {
                ((c) => {
                    PubSub.subscribe(c, () => {
                        this.handleCmd(c);
                    });
                })(c);
            });
        }

        setSessionInfo(sessionId, db) {
            this.sessionId = sessionId;
            this.db = db;
            Logger.Log(TAG$a, `sessionId: ${sessionId} db: ${db}`);
        }

        async init() {
            this.$root = document.getElementById('app-right-panel');
            this.$footer = document.getElementById('footer-right-panel');
            this.$timeTaken = document.getElementById('time-taken');
            this.$rowsAffected = document.getElementById('rows-affected');

            let $g1 = document.getElementById('query-container');
            let $e1 = document.getElementById('query-editor');
            let $e2 = document.getElementById('query-results');
            let $resizer = document.getElementById('query-container-resizer');
            new GridResizerV($g1, $e1, $resizer, $e2);

            this.$queryResults = document.getElementById('query-results');
            this.$table = this.$queryResults.querySelector('table');
            this.tableUtils = new TableUtils(this.$queryResults);

            this.editor = new Ace('query-editor');
            await this.editor.init();

            this.$formatQuery = document.getElementById('format-query');

            this.$formatQuery.addEventListener('click', async (e) => {
                this.handleCmd(Constants.CMD_FORMAT_QUERY);
            });

            this.$runQuery = document.getElementById('run-query');
            this.$runQuery.addEventListener('click', async (e) => {
                this.handleCmd(Constants.CMD_RUN_QUERY);
            });

            this.$runAll = document.getElementById('run-all');
            this.$runAll.addEventListener('click', async (e) => {
                this.handleCmd(Constants.CMD_RUN_ALL);
            });

            this.$exportResults = document.getElementById('export-results');
            this.$exportResults.addEventListener('click', async (e) => {
                this.handleCmd(Constants.CMD_EXPORT);
            });

            this.$next = document.getElementById('next');
            this.$next.addEventListener('click', async (e) => {
                this.handleCmd(Constants.CMD_NEXT_ROWS);
            });
        }

        async handleCmd(cmd) {
            let q;
            switch (cmd) {
            case Constants.CMD_RUN_QUERY:
                this.cursorId = null;
                q = this.editor.getValue();
                this.runQuery(q);
                break;

            case Constants.CMD_RUN_ALL:
                this.runAll();
                break;

            case Constants.CMD_NEXT_ROWS:
                q = this.editor.getValue();
                this.runQuery(q, false);
                break;

            case Constants.CMD_EXPORT:
                this.handleExport();
                break;

            case Constants.CMD_FORMAT_QUERY:
                this.formatQuery();
                break;
            }
        }

        async handleExport() {
            let q = this.editor.getValue();
            let dbUtils = new DbUtils();
            let err = await dbUtils.exportResults.apply(this, [q]);

            if (err == Err.ERR_NONE) {
                PubSub.publish(Constants.QUERY_DISPATCHED, {
                    query: q,
                    tags: [Constants.USER]
                });
            }
        }

        async runQuery(q, save = true) {
            if (!this.db) {
                alert('No database selected');
                return {
                    'status': 'error',
                    'msg': 'No database selected'
                }
            }

            this.tableUtils.clearInfo.apply(this);

            q = q.trim();

            if (!/^select|show/i.test(q)) {
                let s = Date.now();

                this.tableUtils.showLoader();
                let dbUtils = new DbUtils();
                let res = await dbUtils.execute.apply(this, [q]);
                if (res.status == "error") {
                    this.tableUtils.hideLoader();
                    return res;
                }

                if (save) {
                    PubSub.publish(Constants.QUERY_DISPATCHED, {
                        query: q,
                        tags: [Constants.USER]
                    });
                }

                let e = Date.now();
                this.tableUtils.showInfo.apply(this, [(e - s), res.data[0][1]]);
                this.tableUtils.hideLoader();
                return {
                    'status': 'ok',
                    'rows-affected': res.data[0][1]
                }
            }

            if (!this.cursorId) {
                this.cursorId = await DbUtils.fetchCursorId(this.sessionId, q);
            }

            let params = {
                'session-id': this.sessionId,
                'cursor-id': this.cursorId,
                'req-id': Utils.uuid(),
                'num-of-rows': Constants.BATCH_SIZE_WS
            };

            let stream = new Stream(Constants.WS_URL + '/fetch_ws?' + new URLSearchParams(params));

            let res = await this.tableUtils.showContents(stream, {}, {}, true);

            //if (res.status == "ok" && save) {
            if (res.status == "ok") {
                this.tableUtils.showInfo.apply(this, [res['time-taken'], res['rows-affected']]);

                PubSub.publish(Constants.QUERY_DISPATCHED, {
                    query: q,
                    tags: [Constants.USER]
                });
            }

            return res;
        }

        async runAll() {
            let queries = this.split(this.editor.getAll());
            for (let i = 0; i < queries.length; i++) {
                let q = queries[i];
                Logger.Log(TAG$a, `running: ${q}`);
                this.cursorId = null;
                let res = await this.runQuery(q);

                if (res.status == "error") {
                    Logger.Log(TAG$a, `runall breaking: ${res.msg}`);
                    break;
                }

                Logger.Log(TAG$a, `${res['rows-affected']}`);
            }
        }

        split(str) {
            let queries = [];
            let tokens = sqlFormatter.format(str, {
                language: 'mysql'
            }).tokens;

            let q = '';
            tokens.forEach((t) => {
                if (t.type == 'operator' && t.value == ';') {
                    queries.push(q);
                    q = '';
                    return;
                }

                q += t.whitespaceBefore + t.value;
            });

            q.trim();
            if (q != '') {
                queries.push(q);
            }
            return queries;
        }

        async formatQuery() {
            let q = this.editor.getValue();
            q = sqlFormatter.format(q, {
                language: 'mysql'
            });

            Logger.Log(TAG$a, JSON.stringify(q.tokens));

            this.editor.setValue(q.query);
            this.editor.clearSelection();
            this.editor.focus();
        }
    }

    const TAG$9 = "query-finder";
    const MAX_DAYS$1 = 10000;
    const VIEW_DAYS = 10;

    class QueryFinder {
        constructor() {
            this.$queries = document.getElementById('queries');
            this.queryTemplate = document.getElementById('query-template').innerHTML;
            this.tootipTemplate = document.getElementById('tooltip-template').innerHTML;
        }

        async init() {
            this.queryDb = new QueryDB(new Logger(), {version: Constants.QUERY_DB_VERSION});
            await this.queryDb.open();

            let queries = await this.queryDb.filter({start: VIEW_DAYS, end: 0}, [], []);
            this.showQueries(queries);
            Logger.Log(TAG$9, JSON.stringify(queries));

            PubSub.subscribe(Constants.QUERY_SAVED, async () => {
                this.reload();
            });

            PubSub.subscribe(Constants.NEW_QUERIES, async () => {
                this.reload();
            });

            this.initTermInput();
            this.initTagInput();
            this.initTagEditor();
            this.initTooltip();
        }

        async reload() {
            let queries = await this.queryDb.filter({start: VIEW_DAYS, end: 0}, [], []);
            this.showQueries(queries);
            Logger.Log(TAG$9, JSON.stringify(queries));
        }

        initTooltip() {
            //show tootip on clicking the query
            this.$queries.addEventListener('click', async (e) => {
                if (!e.target.classList.contains('query-text')) {
                    return;
                }
                Logger.Log(TAG$9, e.target.classList);
                let id = parseInt(e.target.dataset.id);

                //todo: why just get does not work ??
                let recs = await this.queryDb.findByIds([id]);
                let r = recs[0];
                let t = tippy(document.querySelector(`.query[data-id="${id}"]`), {
                    onHidden(instance) {
                        Logger.Log(TAG$9, "destroying");
                        instance.destroy();
                    }
                });

                let q = sqlFormatter.format(r.query, {language: 'mysql'});

                t.setProps({
                    content: Utils.processTemplate(this.tootipTemplate, {id: id, query: q.query}),
                    placement: 'right',
                    delay: 0,
                    allowHTML: true,
                    interactive: true,
                });

                t.show();
            });

            //copy to clipboard 
            this.$queries.addEventListener('click', async (e) => {
                if (!e.target.classList.contains('copy-query')) {
                    return;
                }

                let id = parseInt(e.target.dataset.id);
                Logger.Log(TAG$9, `Copying ${id}`);
                let recs = await this.queryDb.findByIds([id]);
                let r = recs[0];
                let q = sqlFormatter.format(r.query, {language: 'mysql'});
                await navigator.clipboard.writeText(q.query);
                e.target.nextElementSibling.innerHTML = "&nbsp;&nbsp;&nbsp;Copied.";
            });
        }

        //set up term input
        initTermInput() {
            let input = document.querySelector('#term-input');
            let tagify = new Tagify(input, {placeholder: 'Search queries'});

            tagify.on('input', async (e) => {
    			var value = e.detail.value;

    			tagify.whitelist = null; // reset the whitelist
    			tagify.loading(true).dropdown.hide();

                let terms = await this.queryDb.listTerms(value);
                Logger.Log(TAG$9, terms);

                tagify.whitelist = terms;
    			tagify.loading(false).dropdown.show(value); // render the suggestions dropdown
    		});

            input.addEventListener('change', async (e) => {
                let terms = [];

                if (e.target.value == '') {
                    let queries = await this.queryDb.filter({start: VIEW_DAYS, end: 0}, [], []);
                    this.showQueries(queries);
                    return;
                }

                Logger.Log(TAG$9, e.target.value);
                let json = JSON.parse(e.target.value);

                for (let i = 0; i < json.length; i++) {
                    terms.push(json[i].value);
                }
                Logger.Log(TAG$9, terms);

                let queries = await this.queryDb.filter({start: MAX_DAYS$1, end: 0}, [], terms);
                this.showQueries(queries);
            });
        }

        //set up tag input
        initTagInput() {
            let input = document.querySelector('#tags-input');
            let tagify = new Tagify(input, {placeholder: 'Search tags'});

            tagify.on('input', async (e) => {
    			var value = e.detail.value;

    			tagify.whitelist = null; // reset the whitelist
    			tagify.loading(true).dropdown.hide();

                let tags = await this.queryDb.listTags(value);
                Logger.Log(TAG$9, tags);

                tagify.whitelist = tags;
    			tagify.loading(false).dropdown.show(value); // render the suggestions dropdown
    		});

            input.addEventListener('change', async (e) => {
                let tags = [];

                if (e.target.value == '') {
                    let queries = await this.queryDb.filter({start: VIEW_DAYS, end: 0}, [], []);
                    this.showQueries(queries);
                    return;
                }

                Logger.Log(TAG$9, e.target.value);
                let json = JSON.parse(e.target.value);

                for (let i = 0; i < json.length; i++) {
                    tags.push(json[i].value);
                }
                Logger.Log(TAG$9, tags);

                let queries = await this.queryDb.filter({start: MAX_DAYS$1, end: 0}, tags, []);
                this.showQueries(queries);
            });
        }

        async showQueries(queries) {
            this.$queries.replaceChildren();
            queries.forEach((q) => {
                let n = Utils.generateNode(this.queryTemplate, {
                    id: q.id,
                    query: Utils.truncate(q.query, 50),
                    timestamp: q.created_at.toLocaleString(),
                    time: q.time ?? '',
                    rows: q.rows ?? '',
                });

                q.tags.forEach((t) => {
                    let tag = Utils.generateNode(`<span class=tag>${t}</span>`, {});
                    n.querySelector('.query-tags').append(tag);
                });
                this.$queries.append(n);
            });
        }

        initTagEditor() {
            document.addEventListener('mouseover', (e) => {
                Logger.Log(TAG$9, "mouseover:" + e.classList);

                if (e.target.classList.contains('query-tags')) {
                    //this is just hover actually
                    Logger.Log(TAG$9, "on query");
                    let $el = e.target;
                    let $tags = $el;

                    if ($tags.querySelector('.new-tag')) {
                        //new tag already present on this query
                        //we have to handle this because mouseover may be triggered multiple times
                        return;
                    }

                    let id = parseInt($el.dataset.id);

                    let $tag = Utils.generateNode(`<span class="tag new-tag" contenteditable>click to add new</span>`, {});
                    $tags.append($tag);

                    //save new tag when user hits tab or enter
                    let $newTag = $tags.querySelector('.new-tag');
                    ((id, $newTag) => {
                        $newTag.addEventListener('keyup', async (e) => {
                            if (e.key == "Tab" || e.key == "Enter") {
                                let tag = $newTag.innerText.trim();
                                if (tag == '') {
                                    $newTag.blur();
                                    return;
                                }

                                Logger.Log(TAG$9, `Setting tag ${tag} on id ${id}`);
                                $newTag.classList.remove('new-tag');
                                $newTag.blur();
                                //get the record, update tags and save. Probably not very efficient
                                let recs = await this.queryDb.findByIds([id]);
                                let newRec = recs[0];
                                newRec.tags.push(tag);
                                Logger.Log(TAG$9, newRec);

                                await this.queryDb.updateTags(newRec);
                                PubSub.publish(Constants.QUERY_UPDATED, {id: id});
                            }

                            if (e.key == "Escape") {
                                $newTag.innerHTML = 'click to add new';
                                $newTag.blur();
                            }
                        });

                        $newTag.addEventListener('click', (e) => {
                            $newTag.innerHTML = '<span>&nbsp</span>';
                        });

                    })(id, $newTag);

                    //delete new tag if user leaves card without editing
                    (($el) => {
                        $el.addEventListener('mouseleave', () => {
                            Logger.Log(TAG$9, "outside query");
                            let $tag = $el.querySelector('.new-tag'); 
                            if ($tag) {
                                $tag.remove();
                            }
                        });
                    })($el);
                }
            });
        }
    }

    const TAG$8 = "file-uploader";

    class FileUploader {
        constructor() {
            //todo: get rid of the fu thing. not required
            this.mID = 'fu-' + Utils.uuid();

            let tmpl = document.getElementById('file-upload-template').innerHTML;
            let n = Utils.generateNode(tmpl, {
                'fu-id': this.mID,
            });
            
            document.querySelector('body').append(n);
            document.querySelector('[type=file]').addEventListener("change", (e) => {
                Logger.Log(TAG$8, 'changed');
    	
                if (e.target.files.length > 0) {
                    let reader = new FileReader();
                    reader.readAsText(e.target.files[0]);

                    reader.addEventListener('load', () => {
                        try {
                            let result = JSON.parse(reader.result);
                            PubSub.publish(Constants.FILE_UPLOADED, result);
                        } catch (e) {
                            alert(e);
                            return;
                        } finally {
                            //self destruct
                            document.querySelector(`#${this.mID}`).remove();
                        }
                    });
                }
            });
        }

        show() {
            Logger.Log(TAG$8, "Showing " + this.mID);
            document.querySelector('[type=file]').click();
        }
    }

    const TAG$7 = "query-history";
    const MAX_DAYS = 10000;

    class QueryHistory {
        constructor() {
            PubSub.subscribe(Constants.QUERY_DISPATCHED, async (q) => {
                Logger.Log(TAG$7, JSON.stringify(q));

                if (!this.queryDb) {
                    await this.init();
                }

                //generate terms for saving to db
                q.terms = Utils.getTerms(q.query);
                let id = await this.queryDb.save(q); 
                Logger.Log(TAG$7, `Saved to ${id}`);
                PubSub.publish(Constants.QUERY_SAVED, {id: id});
            });

            PubSub.subscribe(Constants.FILE_UPLOADED, async (data) => {
                await this.handleUpload(data);
            });

            let $download = document.getElementById('download-history');
            if ($download) {
                //download icon is not present on content page
                $download.addEventListener('click', async () => {
                    await this.handleDownload();
                });

                document.getElementById('import-file').addEventListener('click', async () => {
                    let uploader = new FileUploader();
                    uploader.show();
                });
            }
        }

        async init() {
            this.queryDb = new QueryDB(new Logger(), {version: Constants.QUERY_DB_VERSION});
            await this.queryDb.open();
        }

        async handleDownload() {
            let queries = await this.queryDb.filter({start: MAX_DAYS, end: 0}, [], []);
            for (let i = 0; i < queries.length; i++) {
                let q = queries[i];
                let year = q.created_at.getFullYear();
                let month = q.created_at.getMonth();
                let date = q.created_at.getDate();
                let hours = q.created_at.getHours();
                let minutes = q.created_at.getMinutes();
                let seconds = q.created_at.getSeconds();

                queries[i]['year'] = year;
                queries[i]['month'] = month;
                queries[i]['date'] = date;
                queries[i]['hours'] = hours;
                queries[i]['minutes'] = minutes;
                queries[i]['seconds'] = seconds;

                delete(queries[i].created_at);
            }

            FileDownloader.download(JSON.stringify(queries), 'data.json', 'application/json');
        }

        async handleUpload(data) {
            progressBar.setOptions({});//no buttons
            PubSub.publish(Constants.INIT_PROGRESS, {});
            PubSub.publish(Constants.START_PROGRESS, {});

            for (let i = 0; i < data.length; i++) {
                let d = data[i];
                if (d.id) {
                    delete(d.id);
                }

                let createdAt = new Date();
                createdAt.setFullYear(d.year);
                createdAt.setMonth(d.month);
                createdAt.setDate(d.date);
                createdAt.setHours(d.hours);
                createdAt.setMinutes(d.minutes);
                createdAt.setSeconds(d.seconds);

                delete(d.year);
                delete(d.month);
                delete(d.date);
                delete(d.hours);
                delete(d.minutes);
                delete(d.seconds);
                d.created_at = createdAt;
                d.terms = Utils.getTerms(d.query);
                let id = await this.queryDb.save(d);

                PubSub.publish(Constants.UPDATE_PROGRESS, {
                    message: `Imported ${i + 1} of ${data.length}`
                });

                Logger.Log(TAG$7, `Saved to ${id}`);
            }
            PubSub.publish(Constants.STOP_PROGRESS, {});
        }
    }

    const TAG$6 = "main-menu";
    class MainMenu {
        static init() {
    		let elementsArray = document.querySelectorAll('[id$="-menu"]');

            elementsArray.forEach((elem) => {
                elem.addEventListener("click", (e) => {
                    Logger.Log(TAG$6, `${e.currentTarget.id} clicked `);
                    MainMenu.handleMenu(e.currentTarget.id);
                });
            });
        }

    	static handleMenu(id) {
    		switch (id) {
    		case 'query-menu':
    			window.location = '/app/queries';
    			break;

    		case 'content-menu':
    			window.location = '/app/tables';
    			break;

    		case 'help-menu':
    			window.open('/app/help', "_blank");
    			break;

    		case 'about-menu':
    			window.open('/app/about', "_blank");
    			break;
    		}
    	}
    }

    const TAG$5 = "db-renamer";

    class Renamer {
        constructor(sessionId) {
            this.sessionId = sessionId;

            this.$dialog = document.getElementById('db-renamer-dialog');
            this.$cancel = this.$dialog.querySelector('.cancel');
            this.$ok = this.$dialog.querySelector('.ok');
            this.$body = this.$dialog.querySelector('.modal-card-body');
            this.$title = this.$dialog.querySelector('.modal-card-title');
            this.$name = this.$dialog.querySelector('#new-db-name');

            this.$ok.addEventListener('click', async () => {
                //close the initial dialog and display a progress dialog
                this.closeDialog();
                progressBar.setOptions({});//no buttons
                PubSub.publish(Constants.INIT_PROGRESS, {});
                PubSub.publish(Constants.START_PROGRESS, {});

                try {
                    let attribs = await this.getCurrentDbAttribs();
                    PubSub.publish(Constants.UPDATE_PROGRESS, {
                        message: `Renaming ${this.db} to ${this.$name.value}`
                    });

                    Logger.Log(TAG$5, `Renaming ${this.db} to ${this.$name.value}`);

                    await this.createNewDb(this.$name.value, attribs);
                    Logger.Log(TAG$5, "Created new DB");
                    PubSub.publish(Constants.UPDATE_PROGRESS, {
                        message: `Created ${this.$name.value}`
                    });

                    await this.renameTables(this.db, this.$name.value);
                    Logger.Log(TAG$5, "Renamed tables");
                    PubSub.publish(Constants.UPDATE_PROGRESS, {
                        message: `Renamed tables`
                    });

                    PubSub.publish(Constants.DB_RENAMED, {
                        'new-db': this.$name.value
                    });
                } catch (e) {
                    Logger.Log(TAG$5, "Error: " + e);
                } finally {
                    PubSub.publish(Constants.STOP_PROGRESS, {});
                }
            });

            this.$cancel.addEventListener('click', () => {
                //if no query in progress this will be ignored
                DbUtils.cancel(this.sessionId, this.cursorId);
                this.closeDialog();
            });
        }

        async getCurrentDbAttribs() {
            let rows = await DbUtils.fetchAll(this.sessionId, 
                `SELECT default_character_set_name, default_collation_name FROM information_schema.SCHEMATA
            WHERE schema_name = "${this.db}"`);
            return {
                'charset': rows[0][1],
                'collation': rows[0][3],
            };
        }

        async renameTables(oldDb, newDb) {
            let tables = await DbUtils.fetchAll(this.sessionId, `show tables from \`${oldDb}\``);
            let dbUtils = new DbUtils();

            for (let i = 0; i < tables.length; i++) {
                Logger.Log(TAG$5, tables[i][1]);
                let t = tables[i][1];
                let query = `rename table \`${oldDb}\`.\`${t}\` to \`${newDb}\`.\`${t}\``;
                let res = await dbUtils.execute.apply(this, [query]);
                if (res.status != "ok") {
                    throw `${res.msg}`;
                }

                PubSub.publish(Constants.UPDATE_PROGRESS, {
                    message: `Renamed ${t}`
                });
            }
        }

        async createNewDb(name, attribs) {
            let query = `create database if not exists \`${name}\` 
            character set ${attribs.charset} collate ${attribs.collation}`;

            let dbUtils = new DbUtils();
            let res = await dbUtils.execute.apply(this, [query]);
            if (res.status != "ok") {
                throw `${res.msg}`;
            }
        }

        async deleteOldDb(db) {
            let query = `drop database \`${db}\``;

            let dbUtils = new DbUtils();
            let res = await dbUtils.execute.apply(this, [query]);
            if (res.status != "ok") {
                throw `${res.msg}`;
            }
        }

        openDialog() {
            this.$dialog.classList.add('is-active');
        }

        closeDialog() {
            this.$dialog.classList.remove('is-active');
        }

        setSessionInfo(sessionId, db) {
            this.sessionId = sessionId;
            this.db = db;
        }

        init(db) {
            this.db = db;
            this.title = `Rename ${this.db} to:`;
            this.$title.innerHTML = this.title;
            this.$name.value = '';
            this.openDialog();
        }

        reset() {
        }
    }

    const TAG$4 = "db-deleter";

    class Deleter {
        constructor(sessionId) {
            this.sessionId = sessionId;

            this.$dialog = document.getElementById('db-deleter-dialog');
            this.$cancel = this.$dialog.querySelector('.cancel');
            this.$ok = this.$dialog.querySelector('.ok');
            this.$body = this.$dialog.querySelector('.modal-card-body');
            this.$body.innerHTML = "This operation will delete the database. Are you sure?";
            this.$title = this.$dialog.querySelector('.modal-card-title');

            this.$ok.addEventListener('click', async () => {
                this.$ok.setAttribute('disabled', 'disabled');
                this.$title.innerHTML = `Deleting ${this.db}..`;

                let query = `drop database \`${this.db}\``;
                Logger.Log(TAG$4, query);

                let dbUtils = new DbUtils();
                let res = await dbUtils.execute.apply(this, [query]);

                if (res.status == "ok") {
                    PubSub.publish(Constants.QUERY_DISPATCHED, {
                        query: query,
                        tags: [Constants.USER]
                    });

                    res.data[0][1];
                    Utils.showAlert(`Deleted database ${this.db}`, 2000);
                    this.closeDialog();
                    this.$ok.removeAttribute('disabled');

                    PubSub.publish(Constants.DB_DELETED, {});
                    return;
                }

                this.$title.innerHTML = this.title;
                this.$ok.removeAttribute('disabled');
            });

            this.$cancel.addEventListener('click', () => {
                //if no query in progress this will be ignored
                DbUtils.cancel(this.sessionId, this.cursorId);
                this.closeDialog();
            });
        }

        openDialog() {
            this.$dialog.classList.add('is-active');
        }

        closeDialog() {
            this.$dialog.classList.remove('is-active');
        }

        setSessionInfo(sessionId, db) {
            this.sessionId = sessionId;
            this.db = db;
        }

        init(db) {
            this.db = db;
            this.title = `Delete ${this.db}?`;
            this.$title.innerHTML = this.title;
            this.openDialog();
        }
    }

    const TAG$3 = "db-menu";

    class DbMenu {
        constructor(sessionId, db) {
            Logger.Log(TAG$3, `sessionId: ${sessionId}`);

            this.sessionId = sessionId;
            this.db = db;
            this.init();
        }

        //public method
        setSessionInfo(sessionId, db) {
            this.sessionId = sessionId;
            this.db = db;

            this.renamer.setSessionInfo(this.sessionId, this.db);
            this.deleter.setSessionInfo(this.sessionId, this.db);

            Logger.Log(TAG$3, `sessionId: ${sessionId} db: ${db}`);
        }

        init() {
            this.initDom();
            this.initHandlers();
            //this.initSubscribers();

            //dropdown handlers
            this.renamer = new Renamer(this.sessionId);
            this.deleter = new Deleter(this.sessionId);
        }

        initDom() {
            this.$dbMenu = document.getElementById('db-operations');
        }

        initHandlers() {
            this.$dbMenu.addEventListener('click', () => {
                if (!this.db) {
                    alert("No database selected");
                    return;
                }
                let $container = this.$dbMenu.parentNode.parentNode;	
                $container.classList.toggle('is-active');
            });

            let elementsArray = document.querySelectorAll('[class~="db-dropdown-item"]');

            elementsArray.forEach((elem) => {
                elem.addEventListener("click", (e) => {
                    let $container = this.$dbMenu.parentNode.parentNode;	
                    $container.classList.toggle('is-active');
                    this.handleMenu(e.currentTarget.id);
                });
            });
        }

        handleMenu(id) {
            Logger.Log(TAG$3, `id: ${id}`);
    		switch (id) {
            case 'rename-db':
                this.renamer.init(this.db);
                break;

            case 'delete-db':
                this.deleter.init(this.db);
                break;
            }
        }
    }

    const TAG$2 = "appbar";
    class AppBar {
        constructor(name, sessionId, db) {
            this.sessionId = sessionId;
            this.db = db;
            this.dbMenu = new DbMenu(this.sessionId, this.db);

            this.$databases = document.getElementById('databases');
            document.getElementById('conn-name').innerHTML = `${name}&nbsp;&nbsp;&nbsp;`;

            this.showDatabases();

            this.$databases.addEventListener('change', () => {
                this.db = this.$databases.value;
                Logger.Log(TAG$2, "Db changed to " + this.db);

                this.dbMenu.setSessionInfo(this.sessionId, this.db);
                PubSub.publish(Constants.DB_CHANGED, {db: this.db});
            });

            PubSub.subscribe(Constants.DB_RENAMED, async (data) => {
                Logger.Log(TAG$2, "Db renamed");
                this.db = data['new-db'];
                await this.showDatabases();
                this.$databases.dispatchEvent(new Event('change'));
            });

            PubSub.subscribe(Constants.DB_DELETED, async (data) => {
                Logger.Log(TAG$2, "Db deleted");
                this.db = '';
                await this.showDatabases();
                this.$databases.dispatchEvent(new Event('change'));
            });
        }

        async showDatabases() {
            let dbs = await DbUtils.fetchAll(this.sessionId, 'show databases');
            dbs = Utils.extractColumns(dbs);
            Utils.setOptions(this.$databases, dbs, this.db);
        }

        setSessionInfo(sessionId) {
            this.sessionId = sessionId;
        }
    }

    const TAG$1 = "workers";
    class Workers {
        constructor() {
            this.$version = document.getElementById('version');
            Logger.Log(TAG$1, `ver: ${this.$version.value}`);
        }

        async initDb() {
            this.queryDb = new QueryDB(new Logger(), {version: Constants.QUERY_DB_VERSION});
            await this.queryDb.open();
        }

        initConnectionWorker() {
            //init must be called after dom is loaded
            this.connectionWorker = new SharedWorker(`/build-0.6/dist/js/connection-worker.js?ver=${this.$version.value}`);
            this.connectionWorker.port.onmessage = (e) => {
                switch (e.data.type) {
                    case Constants.DEBUG_LOG:
                        Logger.Log("connection-worker", e.data.payload);
                        break;

                    case Constants.NEW_CONNECTIONS:
                        PubSub.publish(Constants.NEW_CONNECTIONS, {});
                        break;
                }
            };
        }

        async initQueryWorker() {
            await this.initDb();

            this.queryWorker = new SharedWorker(`/build-0.6/dist/js/query-worker.js?ver=${this.$version.value}`);
            this.queryWorker.port.onmessage = async (e) => {
                switch (e.data.type) {
                case Constants.DEBUG_LOG:
                    Logger.Log("query-worker", e.data.payload);
                    break;

                case Constants.NEW_QUERIES:
                    PubSub.publish(Constants.NEW_QUERIES, {});
                    break;

                case Constants.EXECUTE_SAVE_REC:
                    Logger.Log("query-worker", Constants.EXECUTE_SAVE_REC);
                    let rec = e.data.data;
                    rec.terms = Utils.getTerms(rec.query);
                    let id = await this.queryDb.save(rec); 

                    this.queryWorker.port.postMessage({
                        type: Constants.EXECUTE_SUCCESS,
                        data: id
                    });
                    break;
                }
            };
        }
    }

    const TAG = "queries";
    class Query {
        constructor() {
            document.addEventListener('DOMContentLoaded', async () => {
                this.adjustView();
                this.init();
            });
        }

        async initHandlers() {
            PubSub.subscribe(Constants.DB_CHANGED, async (data) => {
                Logger.Log(TAG, "Db changed");
                this.creds.db = data.db;
                Utils.saveToSession(Constants.CREDS, JSON.stringify(this.creds));

                //if db has changed we have to create new session
                this.sessionId = await DbUtils.login(this.creds);

                //update session id in modules
                this.setSessionInfo();
            });

            this.workers = new Workers();
            this.workers.initQueryWorker();
            this.workers.initConnectionWorker();

            PubSub.subscribe(Constants.QUERY_SAVED, async () => {
                this.workers.queryWorker.port.postMessage({
                    type: Constants.QUERY_SAVED
                });
            });

            PubSub.subscribe(Constants.QUERY_UPDATED, async () => {
                this.workers.queryWorker.port.postMessage({
                    type: Constants.QUERY_UPDATED
                });
            });
        }

        async init() {
            MainMenu.init();

            let creds = Utils.getFromSession(Constants.CREDS);
            if (!creds) {
                window.location = '/connections';
                return;
            }

            this.creds = JSON.parse(creds);
            this.sessionId = await DbUtils.login(this.creds);
            Logger.Log(TAG, this.sessionId);

            this.queryRunner = new QueryRunner(this.sessionId);
            this.history = new QueryHistory();
            await this.history.init();

            this.finder = new QueryFinder();
            await this.finder.init();

            this.initHandlers();

            this.appbar = new AppBar(this.creds.name, this.sessionId, this.creds.db);

            if (this.creds.db) {
                this.setSessionInfo();
            }

            let $g1 = document.getElementById('app-content');
            let $e1 = document.getElementById('app-left-panel-container');
            let $e2 = document.getElementById('app-right-panel');
            let $resizer = document.getElementById('app-content-resizer');
            new GridResizerH($g1, $e1, $resizer, $e2);
        }

        setSessionInfo() {
            this.queryRunner.setSessionInfo(this.sessionId, this.creds.db);
            this.appbar.setSessionInfo(this.sessionId);
        }

        adjustView() {
            let bodyDims = document.querySelector('body').getBoundingClientRect();
            let appbarDims = document.querySelector('#appbar').getBoundingClientRect();
            let appLeftPanel = document.querySelector('#app-left-panel');
            appLeftPanel.style.height = (bodyDims.height - appbarDims.height) + 'px';

            let appRightPanel = document.getElementById('app-right-panel');
            appRightPanel.style.height = (bodyDims.height - appbarDims.height) + 'px';
        }
    }

    new Query();

})();
