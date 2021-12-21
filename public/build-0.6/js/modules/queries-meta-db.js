import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { BaseMetaDB } from './base-meta-db.js'

const TAG = "queries-meta-db"

class QueriesMetaDB extends BaseMetaDB {
    constructor(logger, options) {
        options.dbName = "queries_meta";
        super(logger, options);
        this.logger = logger;
        this.store = "queries_meta";
    }

    onUpgrade(e) {
        this.logger.log(TAG, `onUpgrade: o: ${e.oldVersion} n: ${e.newVersion}`);
        if (e.oldVersion < 1) {
            let store = e.target.result.createObjectStore(
                this.store, { keyPath: 'id', autoIncrement: true });
        }
    }
} 

export { QueriesMetaDB }
