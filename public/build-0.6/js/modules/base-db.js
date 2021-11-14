import { Logger } from './logger.js'
import { Constants } from './constants.js'

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
            let transaction = this.db.transaction(this.store)
            let objectStore = transaction.objectStore(this.store)

            let results = []
            objectStore.openCursor().onsuccess = (e) => {
                var cursor = e.target.result;
                if (cursor) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results);
                }
            }
        })
    }
}

export { BaseDB }
