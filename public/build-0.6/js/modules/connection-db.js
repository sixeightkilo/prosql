import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { BaseDB } from './base-db.js'
import { Utils } from './utils.js'

const TAG = "connection-db"
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
        this.logger.log(TAG, `open.onupgradeneeded: ${e.oldVersion}`);
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
            this.logger.log(TAG, e.message);
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

            let request = index.get(IDBKeyRange.only([conn.name, conn.user, conn.host, conn.port, conn.db]))
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
                o['db_id'] = conn.db_id
                o['synced_at'] = Utils.getTimestamp()

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
            let index = objectStore.index(DB_ID_INDEX);

            let request = index.get(IDBKeyRange.only([id]))
            request.onsuccess = (e) => {
                this.logger.log(TAG, JSON.stringify(request.result));
                resolve(request.result);
            };

            request.onerror = (e) => {
                this.logger.log(TAG, "error");
                resolve(e.target.error);
            };
        })
    }
} 

export { ConnectionDB }
