import { Utils } from './utils.js'
import { Log } from './logger.js'
import { Constants } from './constants.js'
import { ConnectionDB } from './connection-db.js'

const TAG = "worker"
const URL = '/browser-api/sqlite'

class Worker {
    constructor(port) {
        this.port = port;
    }

    async init() {
        Log(TAG, "worker init", this.port);

        let res = await Utils.fetch(Constants.URL + '/about', false);
        if (res.status == "error") {
            Log(TAG, JSON.stringify(res), this.port);
            return
        }

        this.deviceId = res.data['device-id'];

        res = await Utils.fetch(`${URL}/connections/updated`, false, {
            db: res.data['device-id']
        });

        Log(TAG, JSON.stringify(res), this.port);

		this.connectionDb = new ConnectionDB({version: Constants.CONN_DB_VERSION});
		await this.connectionDb.open();

        this.syncUp();
    }

    async syncUp() {
        //find all records missing db_id and sync them up to cloud
        let conns = await this.connectionDb.getAll();
        if (conns.length == 0) {
            return;
        }

        for (let i = 0; i < conns.length; i++) {
            if (!conns[i].db_id) {
                let res = await fetch(`${URL}/connections`, {
                    body: JSON.stringify(conns[i]),
                    method: "post",
                    headers: {
                        db: this.deviceId,
                        'Content-Type': 'application/json',
                    }
                });

                Log(TAG, "Syncing2: " + JSON.stringify(conns[i]), this.port);

                res = await res.json();
                Log(TAG, JSON.stringify(res), this.port);

                if (res.status == "ok") {
                    conns[i].db_id = res.data.db_id;
                    Log(TAG, `syncing: ${JSON.stringify(conns[i])}`, this.port);
                    try {
                        this.connectionDb.sync(conns[i])
                    } catch (e) {
                        Log(TAG, e, this.port)
                    }
                }
            }
        }
    }
}
export { Worker }
