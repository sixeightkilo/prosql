import { Log } from './logger.js'
import { Constants } from './constants.js'

const TAG = "index-db"
class IndexDB {
    async open() {
        return new Promise((resolve, reject) => {
            var req = indexedDB.open(Constants.DB_NAME, Constants.DB_VERSION);

            req.onsuccess = (e) => {
                Log(TAG, "open.onsuccess");
                this.db = req.result
                resolve(0)
            };

            req.onerror = (e) => {
                Log(TAG, "open.onerror");
                reject(e.target.errorCode);
            };

            req.onupgradeneeded = (e) => {
                Log(TAG, "open.onupgradeneeded");
                var store = e.currentTarget.result.createObjectStore(
                    Constants.CONNECTIONS, { keyPath: 'id', autoIncrement: true });
                store.createIndex("connection-index", ["name", "user", "pass", "port", "db"], { unique: true });
            };
        })
    }

    async save(conn) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction([Constants.CONNECTIONS], "readwrite")

            transaction.onerror = (e) => {
                reject(e.target.error);
            };

            let objectStore = transaction.objectStore(Constants.CONNECTIONS)
            let request = objectStore.add(conn);
            request.onsuccess = (e) => {
                resolve(e.target.result);
            };
        })
    }

    async getAll() {
        this.results = [];
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction(Constants.CONNECTIONS)
            let objectStore = transaction.objectStore(Constants.CONNECTIONS)

            objectStore.openCursor().onsuccess = (e) => {
                var cursor = e.target.result;
                if (cursor) {
                    let o = {}
                    for (let key in cursor.value) {
                        o[key] = cursor.value[key] 
                    }

                    this.results.push(o);
                    cursor.continue();
                } else {
                    Log(TAG, "No more entries!");
                }
            }

            transaction.oncomplete = (e) => {
                resolve(this.results);
            };

            transaction.onerror = (e) => {
                reject(e.target.error);
            };
        })
    }

    async get(id) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction(Constants.CONNECTIONS)
            let objectStore = transaction.objectStore(Constants.CONNECTIONS)
            let request = objectStore.get(id);

            request.onsuccess = (e) => {
                resolve(request.result);
            };

            request.onerror = (e) => {
                reject(e.target.error);
            };
        })
    }

    async put(id, isDefault) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction(Constants.CONNECTIONS, "readwrite");
            let objectStore = transaction.objectStore(Constants.CONNECTIONS);
            let request = objectStore.get(id);

            request.onsuccess = (e) => {
                let o = event.target.result;
                o['is-default'] = isDefault;

                let requestUpdate = objectStore.put(o);
                requestUpdate.onerror = function(event) {
                    reject(e.target.error);
                };
                requestUpdate.onsuccess = function(event) {
                    resolve(0);
                };
            };

            request.onerror = (e) => {
                reject(e.target.error);
            };
        })
    }

    async del(id) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction(Constants.CONNECTIONS, "readwrite");
            let objectStore = transaction.objectStore(Constants.CONNECTIONS);
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

    async search(conn) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction(Constants.CONNECTIONS)
            let objectStore = transaction.objectStore(Constants.CONNECTIONS)
            let index = objectStore.index('connection-index');

            let request = index.get(IDBKeyRange.only([conn.name, conn.user, conn.pass, conn.port, conn.db]))
            request.onsuccess = (e) => {
                resolve(request.result);
            };

            request.onerror = (e) => {
                reject(e.target.error);
            };
        })
    }
}
export { IndexDB }
