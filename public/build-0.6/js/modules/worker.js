import { Utils } from './utils.js'
import { Log } from './logger.js'
import { Constants } from './constants.js'
import { ConnectionDB } from './connection-db.js'

const TAG = "worker"
const URL = '/browser-api/sqlite'

class Worker {
    constructor(port) {
        this.port = port;
        //this.port.postMessage(Constants.USER);
    }

    async init() {
        let res = await Utils.fetch(Constants.URL + '/about', false);
        if (res.status == "error") {
            Log(TAG, JSON.stringify(res), this.port);
            return
        }

        res = await Utils.fetch(`${URL}/connections/updated`, false, {
            db: res.data['device-id']
        });

        Log(TAG, JSON.stringify(res), this.port);
    }
}
export { Worker }
