import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { BaseDB } from './base-db.js'

const TAG = "connections-meta-db"

class ConnectionsMetaDB extends BaseDB {
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

    async save(rec) {
        this.logger.log(TAG, "save");
        let r = await super.get(rec.id);

        if (r != null) {
            await super.put(this.store, rec);
            return
        }

        await super.save(this.store, rec);
    }
} 

export { ConnectionsMetaDB }
