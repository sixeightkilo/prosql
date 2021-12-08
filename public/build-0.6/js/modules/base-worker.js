import { Utils } from './utils.js'
import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { QueryDB } from './query-db.js'
import { MetaDB } from './meta-db.js'

const TAG = "main"
const URL = '/browser-api/sqlite'

class BaseWorker {
    constructor(port) {
        this.port = port;
        this.logger = new Logger(this.port);

        this.port.onmessage = (m) => {
            this.handleMessage(m);
        }
    }

    async init() {
        let res = await Utils.fetch(Constants.URL + '/about', false);
        if (res.status == "error") {
            this.logger.log(TAG, JSON.stringify(res));
            return
        }

        this.deviceId = res.data['device-id'];
    }

    async getLastSyncTs(db, id) {
        let rec = await db.get(parseInt(id));
        if (rec == null) {
            return new Date(Constants.EPOCH_TIMESTAMP);
        }

        return rec.last_sync_ts
    }

    async setLastSyncTs(db, id) {
        await db.save({
            id: parseInt(id),
            last_sync_ts: new Date()
        })
    }
}
export { BaseWorker }
