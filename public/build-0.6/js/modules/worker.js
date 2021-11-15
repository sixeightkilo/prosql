import { Utils } from './utils.js'
import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { ConnectionDB } from './connection-db.js'

const TAG = "main"
const URL = '/browser-api/sqlite'
const SYNCUP_INTERVAL = 1 * 60 * 1000;//5 minutes
const EPOCH_TIMESTAMP = '2021-01-01 00:00:00';

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

		this.connectionDb = new ConnectionDB(this.logger, {version: Constants.CONN_DB_VERSION});
		await this.connectionDb.open();

        this.syncDown();

        //this.logger.log(TAG, "Starting syncup timer");
        //this.syncUp();
        //setInterval(() => {
            //this.syncUp();
        //}, SYNCUP_INTERVAL);
    }

    async syncDown() {
        let res = await Utils.fetch(`${URL}/connections/updated`, false, {
            db: this.deviceId,
            after: await this.getLastSyncTs()
        });

        this.logger.log(TAG, JSON.stringify(res));
        if (res.status == "ok") {
            let conns = res.data.connections
            //see if we have connections with the remote db_id, otherwise insert
            this.logger.log(TAG, "Checking dbids")
            for (let i = 0; i < conns.length; i++) {
                if (conns[i].status == "deleted") {
                    continue;
                }

                let c = await this.connectionDb.findByDbId(conns[i].id)
                this.logger.log(TAG, `c: ${c}`)

                if (!c) {
                    delete conns[i].created_at;
                    delete conns[i].updated_at;
                    delete conns[i].status;

                    conns[i].db_id = conns[i].id
                    delete conns[i].id;
                    conns[i].synced_at = Utils.getTimestamp();

                    let id = await this.connectionDb.save(conns[i]);
                    this.logger.log(TAG, `saved to : ${id}`);
                }
            }
        }
    }

    async getLastSyncTs() {
        let conns = await this.connectionDb.getAll();
        this.logger.log(TAG, `l: ${conns.length}`);

        if (conns.length == 0) {
            return EPOCH_TIMESTAMP;
        }
        //debug
        this.logger.log(TAG, "Returning EPOCH_TIMESTAMP anyway");
        return EPOCH_TIMESTAMP;
    }

    async syncUp() {
        //find all records missing db_id and sync them up to cloud
        let conns = await this.connectionDb.getAll();
        if (conns.length == 0) {
            this.logger.log(TAG, "Nothing to sync");
            return;
        }

        for (let i = 0; i < conns.length; i++) {
            if (conns[i].db_id) {
                this.logger.log(TAG, `Skipping ${conns[i].id}: ${conns[i].db_id}`);
                continue;
            }

            let res = await fetch(`${URL}/connections`, {
                body: JSON.stringify(conns[i]),
                method: "post",
                headers: {
                    db: this.deviceId,
                    'Content-Type': 'application/json',
                }
            });

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
export { Worker }
