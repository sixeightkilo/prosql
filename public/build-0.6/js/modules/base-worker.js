import { Utils } from './utils.js'
import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { QueryDB } from './query-db.js'

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

    async getLastSyncTs(recs) {
        let lastSyncTs = new Date(Constants.EPOCH_TIMESTAMP);

        if (recs.length == 0) {
            this.logger.log(TAG, `getLastSyncTs: returning epoch`);
            return lastSyncTs.toISOString();
        }

        //get the latest sync time
        recs.forEach((r) => {
            let syncedAt = r.synced_at ?? null;
            if (!syncedAt) {
                return
            }

            if (syncedAt > lastSyncTs) {
                lastSyncTs = r.synced_at;
            }
        });

        this.logger.log(TAG, `lastSyncTs: ${lastSyncTs}`);
        return lastSyncTs.toISOString();
    }
}
export { BaseWorker }
