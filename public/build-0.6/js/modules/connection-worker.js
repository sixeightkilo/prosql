import { Utils } from './utils.js'
import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { ConnectionDB } from './connection-db.js'

const TAG = "main"
const URL = '/browser-api/sqlite'
const SYNCUP_INTERVAL_MIN = 10000;//1 min
const SYNCUP_INTERVAL_MAX = 20000;//2 min
const EPOCH_TIMESTAMP = '2021-01-01T00:00:00Z';

class ConnectionWorker {
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

        this.logger.log(TAG, "Starting syncup timer");
        this.syncUp();
        setInterval(() => {
            this.syncUp();
        }, Utils.getRandomIntegerInclusive(SYNCUP_INTERVAL_MIN, SYNCUP_INTERVAL_MAX));
    }

    async syncDown() {
        let res = await Utils.fetch(`${URL}/connections/updated`, false, {
            db: this.deviceId,
            after: await this.getLastSyncTs()
        });

        this.logger.log(TAG, "Sync down: " + JSON.stringify(res));
        if (res.status == "ok") {
            let updateUI = false;
            let conns = res.data.connections

            for (let i = 0; i < conns.length; i++) {
                //check if the remore connection is already present in local db
                let c = await this.connectionDb.findByDbId(conns[i].id)

                //this may be deleted on the server. Handle this first
                if (conns[i].status == "deleted") {
                    if (c == null) {
                        this.logger.log(TAG, `already deleted: ${conns[i].id}`)
                        continue;
                    }

                    this.logger.log(TAG, `deleting: ${JSON.stringify(c)}`)
                    await this.connectionDb.del(c.id);
                    updateUI = true;
                    continue;
                }

                //this looks like a new connection
                if (c == null) {
                    this.logger.log(TAG, `inserting: ${JSON.stringify(c)}`)
                    delete conns[i].created_at;
                    delete conns[i].updated_at;
                    delete conns[i].status;

                    conns[i].db_id = conns[i].id
                    delete conns[i].id;
                    conns[i].synced_at = Utils.getTimestamp();

                    let id = await this.connectionDb.save(conns[i]);
                    this.logger.log(TAG, `saved to : ${id}`);
                    if (id >= 1) {
                        updateUI = true;
                    }
                } else {
                    //nope. may be is-default got updated..
                    await this.connectionDb.put(c.id, c.pass, conns[i].is_default);
                    updateUI = true;
                    this.logger.log(TAG, `Updated ${c.id}`);
                }
            }

            if (updateUI) {
                this.port.postMessage({
                    type: Constants.NEW_CONNECTIONS,
                })
            }
        }
    }

    async getLastSyncTs() {
        let conns = await this.connectionDb.getAll();
        this.logger.log(TAG, `l: ${conns.length}`);

        if (conns.length == 0) {
            return EPOCH_TIMESTAMP;
        }
        //get the latest sync time
        let lastSyncTs = EPOCH_TIMESTAMP;
        conns.forEach((c) => {
            let syncedAt = q.synced_at ?? null;
            if (!syncedAt) {
                return
            }

            if (syncedAt > lastSyncTs) {
                lastSyncTs = c.synced_at;
            }
        });

        this.logger.log(TAG, `lastSyncTs: ${lastSyncTs}`);
        return lastSyncTs;
    }

    async syncUp() {
        //find all records missing db_id and sync them up to cloud
        let conns = await this.connectionDb.getAll();
        if (conns.length == 0) {
            this.logger.log(TAG, "Nothing to sync");
            return;
        }

        let deleted = [];
        for (let i = 0; i < conns.length; i++) {
            //when we delete from UI, we just mark the status as deleted, then sync up later
            let isDeleted = ((conns[i].status ?? Constants.STATUS_ACTIVE) == Constants.STATUS_DELETED) ? true : false;

            if (isDeleted) {
                this.logger.log(TAG, `Deleting ${conns[i].id}`);
                if (!conns[i].db_id) {
                    //this has not been synced yet. We can safely delete
                    this.connectionDb.del(conns[i].id);
                    continue;
                }

                deleted.push(conns[i]);
                continue;
            }

            //every record may or may not have updated_at
            let updatedAt = conns[i].updated_at ?? EPOCH_TIMESTAMP;

            if (conns[i].db_id) {
                //if it has a db_id , it is guaranteed to haved synced_at
                if (conns[i].synced_at > updatedAt) {
                    this.logger.log(TAG, `Skipping ${conns[i].id}: ${conns[i].db_id}`);
                    continue;
                }
            }

            let res = await fetch(`${URL}/connections`, {
                body: JSON.stringify(conns[i]),
                method: "POST",
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

        this.syncDeleted(deleted);
    }

    async syncDeleted(deleted) {
        if (deleted.length == 0) {
            return;
        }

        let ids = [];
        deleted.forEach((d) => {
            ids.push(d.db_id);
        });

        this.logger.log(TAG, JSON.stringify(ids));
        let res = await fetch(`${URL}/connections`, {
            body: JSON.stringify(ids),
            method: "DELETE",
            headers: {
                db: this.deviceId,
                'Content-Type': 'application/json',
            }
        });

        res = await res.json();
        this.logger.log(TAG, JSON.stringify(res));
        //delete from local db
        for (let i = 0; i < res.data.ids.length; i++) {
            let c = await this.connectionDb.findByDbId(res.data.ids[i]);
            await this.connectionDb.destroy(c.id);
            this.logger.log(TAG, `Destroyed: ${c.id}`);
        }
    }
}
export { ConnectionWorker }
