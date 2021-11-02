import { Constants } from './constants.js'
import { ConnectionDB } from './connection-db.js'

onconnect = async (e) => {
    var port = e.ports[0];

    let connectionDb = new ConnectionDB({version: 1});
    await connectionDb.open();

    port.onmessage = (e) => {
        port.postMessage(Constants.USER)
    }
}
