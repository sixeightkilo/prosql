import { ConnectionWorker } from './modules/connection-worker.js'

onconnect = async (e) => {
    let port = e.ports[0];
    let w = new ConnectionWorker(port);
    w.init();
}
