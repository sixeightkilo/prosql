import { Utils } from './utils.js'
import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { QueryDB } from './query-db.js'
import { MetaDB } from './meta-db.js'

const TAG = "base"
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
        let res = await Utils.get(Constants.URL + '/about', false);
        if (res.status == "error") {
            this.logger.log(TAG, JSON.stringify(res));
            return
        }

        this.deviceId = res.data['device-id'];

        //regiser this device with backend.
        //If signin-required, force user to signin/signup
        //After user signs up clear all db_id, because we are moving to a new db

        res = await Utils.post('/browser-api/devices/register', {
            'device-id': this.deviceId
        }, false)

        this.logger.log(TAG, JSON.stringify(res));

        if (res.status == "error") {
            return;
        }

        this.sessionId = res.data['session-id'];
        this.dbName = res.data['db-name'];

        if (res.data['signin-required']) {
            //check if user is already logged in
            //must check for user data. session-id will have a value even if user is not logged in due to guest login
            if (Utils.isEmpty(res.data.user)) {
                this.logger.log(TAG, "Signin required");
                this.port.postMessage({
                    type: Constants.SIGNIN_REQUIRED
                })
            }
        }
    }

	async getLastSyncTs(db, id) {
        let rec = await db.get(parseInt(id));
        if (rec == null) {
            return new Date(Constants.EPOCH_TIMESTAMP);
        }

        return rec.last_sync_ts ?? new Date(Constants.EPOCH_TIMESTAMP);
    }

    async setLastSyncTs(db, id) {
        let rec = await db.get(parseInt(id));

        if (rec == null) {
            await db.save({
                id: parseInt(id),
                last_sync_ts: new Date()
            })
            return;
        }

        rec.last_sync_ts = new Date();
        await db.put(rec)
    }

    async getDbName(db, id) {
        let rec = await db.get(parseInt(id));
        if (rec == null) {
            return '';
        }

        return rec.db_name ?? '';
    }

    async setDbName(db, id, dbName) {
        let rec = await db.get(parseInt(id));

        if (rec == null) {
            await db.save({
                id: parseInt(id),
                db_name: dbName
            })
            return;
        }

        rec.db_name = dbName;
        await db.put(rec)
    }
}
export { BaseWorker }
