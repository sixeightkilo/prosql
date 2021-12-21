import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { BaseMetaDB } from './base-meta-db.js'

const TAG = "connections-meta-db"

class ConnectionsMetaDB extends BaseMetaDB {
    constructor(logger, options) {
        options.dbName = "connections_meta";
        super(logger, options);
        this.logger = logger;
        this.store = "connections_meta";
    }

    onUpgrade(e) {
        this.logger.log(TAG, `onUpgrade: o: ${e.oldVersion} n: ${e.newVersion}`);
        if (e.oldVersion < 1) {
            let store = e.target.result.createObjectStore(
                this.store, { keyPath: 'id', autoIncrement: true });
        }
    }
} 

export { ConnectionsMetaDB }
