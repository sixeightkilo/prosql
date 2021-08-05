import { Log } from './logger.js'
import { Constants } from './constants.js'
import { BaseDB } from './base-db.js'

const TAG = "connection-db"
const CONNECTION_INDEX = "connection-index";
const DB_NAME = "connections";

class ConnectionDB extends BaseDB {
    constructor(options) {
        options.dbName = DB_NAME;
        super(options);
        this.store = "connections";
    }

    onUpgrade(e) {
        Log(TAG, "open.onupgradeneeded");
        var store = e.currentTarget.result.createObjectStore(
            this.store, { keyPath: 'id', autoIncrement: true });
        store.createIndex(CONNECTION_INDEX, ["name", "user", "pass", "port", "db"], { unique: true });
    }

    async save(conn) {
        try {
            //make sure there is only one connection with is-default = true
            if (conn['is-default'] == true) {
                let conns = await super.getAll();
                conns.forEach(async (c) => {
                    await this.put(c.id, false);
                });
            }

            //search if this connection exists
            let rec = await this.search(conn);
            if (rec) {
                //if exists , update and return
                await this.put(rec.id, conn['is-default']);
                return rec.id;
            }

            //create new record
            return await super.save(this.store, conn);

        } catch (e) {
            Log(TAG, e.message);
        }
    }

    async put(id, isDefault) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction(this.store, "readwrite");
            let objectStore = transaction.objectStore(this.store);
            let request = objectStore.get(id);

            request.onsuccess = (e) => {
                let o = e.target.result;
                o['is-default'] = isDefault;

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

            let request = index.get(IDBKeyRange.only([conn.name, conn.user, conn.pass, conn.port, conn.db]))
            request.onsuccess = (e) => {
                resolve(request.result);
            };

            request.onerror = (e) => {
                resolve(e.target.error);
            };
        })
    }

} 

export { ConnectionDB }
