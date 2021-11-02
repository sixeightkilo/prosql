import { Worker } from './worker.js'

onconnect = async (e) => {
    let port = e.ports[0];
    let w = new Worker(port);
    w.init();
}
