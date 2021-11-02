import { Worker } from './worker.js'

onconnect = async (e) => {
    var port = e.ports[0];
    new Worker(port) 
}
