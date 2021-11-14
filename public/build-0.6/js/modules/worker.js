import { Utils } from './utils.js'
import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { ConnectionDB } from './connection-db.js'

const TAG = "main"
const URL = '/browser-api/sqlite'

class Worker {
    constructor(port) {
        this.port = port;
        this.logger = new Logger(this.port);
    }

    async init() {
        let res = await Utils.fetch(Constants.URL + '/about', false);
        if (res.status == "error") {
            this.logger.log(TAG, JSON.stringify(res));
            return
        }

        this.deviceId = res.data['device-id'];

        res = await Utils.fetch(`${URL}/connections/updated`, false, {
            db: res.data['device-id']
        });

        this.logger.log(TAG, JSON.stringify(res));

		this.connectionDb = new ConnectionDB(this.logger, {version: Constants.CONN_DB_VERSION});
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

                this.logger.log(TAG, "Syncing2: " + JSON.stringify(conns[i]));

                res = await res.json();
                this.logger.log(TAG, JSON.stringify(res));

                if (res.status == "ok") {
                    conns[i].db_id = res.data.db_id;
                    this.logger.log(TAG, `syncing: ${JSON.stringify(conns[i])}`);
                    try {
                        this.connectionDb.sync(conns[i])
                    } catch (e) {
                        this.logger.log(TAG, e, this.port)
                    }
                }
            }
        }
    }
}
export { Worker }
