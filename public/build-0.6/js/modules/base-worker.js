import { Utils } from './utils.js'
import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { QueryDB } from './query-db.js'
import { MetaDB } from './meta-db.js'

const TAG = "base"
const URL = '/worker-api/sqlite'

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

        res = await Utils.post('/worker-api/devices/register', {
            'device-id': res.data['device-id'],
            'version': res.data['version'],
            'os': res.data['os'],
        }, false)

        this.logger.log(TAG, JSON.stringify(res));

        if (res.status == "error") {
            return;
        }

        this.db = res.data.db;
    }

    async reset(db) {
        let recs = await db.getAll();
        for (let i = 0; i < recs.length; i++) {
            await db.reset(recs[i]);
        }
    }
}
export { BaseWorker }
