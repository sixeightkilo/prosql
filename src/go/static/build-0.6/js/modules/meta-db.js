import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { BaseDB } from './base-db.js'

const TAG = "meta-db"

class MetaDB extends BaseDB {
    constructor(logger, options) {
        options.dbName = "meta";
        super(logger, options);
        this.logger = logger;
        this.store = "meta";
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

export { MetaDB }
