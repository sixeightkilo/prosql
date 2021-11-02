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
        let res = await fetch(`${URL}/about`);
        res = await res.json();
        Log(TAG, JSON.stringify(res), this.port);
    }
}
export { Worker }
