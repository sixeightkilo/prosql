import { QueryWorker } from './modules/query-worker.js'

onconnect = async (e) => {
    let port = e.ports[0];
    let w = new QueryWorker(port);
    w.init();
}
