import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { BaseDB } from './base-db.js'

const TAG = "base-meta-db";
const ID = 1;

class BaseMetaDB extends BaseDB {
    async getDbName() {
        let rec = await super.get(parseInt(ID));
        if (rec == null) {
            return '';
        }

        return rec.db_name ?? '';
    }

    async setDbName(dbName) {
        this.logger.log(TAG, "setDbName");
        let rec = await super.get(parseInt(ID));

        if (rec == null) {
            await this.save(this.store, {
                id: parseInt(ID),
                db_name: dbName
            })
            return;
        }

        rec.db_name = dbName;
        await this.put(this.store, rec)
    }

    async getLastSyncTs() {
        let rec = await super.get(parseInt(ID));
        if (rec == null) {
            return new Date(Constants.EPOCH_TIMESTAMP);
        }

        return rec.last_sync_ts ?? new Date(Constants.EPOCH_TIMESTAMP);
    }

    async setLastSyncTs() {
        let rec = await super.get(parseInt(ID));

        if (rec == null) {
            await super.save(this.store, {
                id: parseInt(ID),
                last_sync_ts: new Date()
            })
            return;
        }

        rec.last_sync_ts = new Date();
        await super.put(this.store, rec)
    }

    async get() {
        return await super.get(parseInt(ID));
    }

    async destroy() {
        return await super.destroy(parseInt(ID));
    }
} 

export { BaseMetaDB }
