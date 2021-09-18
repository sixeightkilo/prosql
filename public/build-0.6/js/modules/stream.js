import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'

const TAG = "stream"

class Stream {
    constructor(url) {
        this.promises = [];
        this.registered = false;

        this.ws = new WebSocket(url);

        this.ws.onerror = (evt) => {
            Log(TAG, "onerror:" + evt);
            this.rej(Err.ERR_NO_AGENT);
        }

        this.ws.onclose = (evt) => {
            Log(TAG, "onclose");
            this.ws = null;
        }
    }

    get() {
        return new Promise((res, rej) => {
            if (!this.registered) {
                this.ws.onmessage = (evt) => {
                    let res = this.promises.shift();
                    let json = JSON.parse(evt.data);
                    if (json.status == "error") {
                        this.rej(json.msg);
                        return;
                    }
                    res(json['k']);
                }
                this.registered = true;
            }

            this.promises.push(res);
            this.rej = rej;
        })
    }
}

export { Stream }
