import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { Utils } from './utils.js'

const TAG = "base-db"
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
                    this.logger.log(TAG, "open.onsuccess");
                    this.db = req.result
                    resolve(0)
                };

                req.onerror = (e) => {
                    this.logger.log(TAG, e.target.error);
                    reject(e.target.errorCode);
                };

                req.onupgradeneeded = (evt) => {
                    this.onUpgrade(evt);
                };
        })
    }

    async save(store, rec) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction([store], "readwrite")

            let objectStore = transaction.objectStore(store)
            let request = objectStore.add(rec);
            request.onsuccess = (e) => {
                resolve(e.target.result);
            };

            request.onerror = (e) => {
                this.logger.log(TAG, e.target.error);
                resolve(-1);
            };
        })
    }

    async put(store, rec) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction([store], "readwrite")
            let objectStore = transaction.objectStore(store)

            rec.updated_at = new Date();
            let request = objectStore.put(rec);
            request.onsuccess = (e) => {
                resolve(0);
            };

            request.onerror = (e) => {
                this.logger.log(TAG, e.target.error);
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
                    result = request.result
                }

                this.logger.log(TAG, JSON.stringify(result));
                resolve(result);
            };

            request.onerror = (e) => {
                resolve(null);
            };
        })
    }

    async getAll(keys = []) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction(this.store)
            let objectStore = transaction.objectStore(this.store)

            let results = []
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
            }
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
            this.logger.log(TAG, "findByDbId");

            let transaction = this.db.transaction(this.store);
            let objectStore = transaction.objectStore(this.store);
            let index = objectStore.index(Constants.DB_ID_INDEX);

            let request = index.get(IDBKeyRange.only([id]))
            request.onsuccess = (e) => {
                resolve(request.result);
            };

            request.onerror = (e) => {
                this.logger.log(TAG, "error");
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
        let result = []
        keys.forEach((k) => {
            result.push(k.replaceAll(/-/g, '_'));
        });
        return result
    }

    static fromDbArray(vals = []) {
        //convert all "_" to "-"
        let result = []
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

export { BaseDB }
