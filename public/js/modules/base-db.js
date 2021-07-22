import { Log } from './logger.js'
import { Constants } from './constants.js'

const TAG = "base-db"
class BaseDB {
    constructor(dbName, version) {
        this.dbName = dbName;
        this.version = version;
    }

    async open() {
        return new Promise((resolve, reject) => {
            let req = indexedDB.open(this.dbName, this.version);

            req.onsuccess = (e) => {
                Log(TAG, "open.onsuccess");
                this.db = req.result
                resolve(0)
            };

            req.onerror = (e) => {
                Log(TAG, "open.onerror");
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

            transaction.onerror = (e) => {
                reject(e.target.error);
            };

            let objectStore = transaction.objectStore(store)
            let request = objectStore.add(rec);
            request.onsuccess = (e) => {
                resolve(e.target.result);
            };

            request.onerror = (e) => {
                Log(TAG, e.target.error);
                resolve(-1);
            };
        })
    }

    async update(store, rec) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction([store], "readwrite")
            let objectStore = transaction.objectStore(store)

            let request = objectStore.put(rec);
            request.onsuccess = (e) => {
                resolve(0);
            };

            request.onerror = (e) => {
                Log(TAG, e.target.error);
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
                //resolve(0);
            };

            transaction.oncomplete = (e) => {
                resolve(0);
            };

            request.onerror = (e) => {
                reject(e.target.error);
            };
        })
    }
}

export { BaseDB }
