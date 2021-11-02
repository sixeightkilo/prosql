import { Constants } from './constants.js'
import { ConnectionDB } from './connection-db.js'

class Worker {
    constructor(port) {
        this.port = port;
        this.port.postMessage(Constants.USER);
    }
}
export { Worker }
