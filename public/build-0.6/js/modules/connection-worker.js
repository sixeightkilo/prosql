import { Utils } from './utils.js'
import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { ConnectionDB } from './connection-db.js'
import { ConnectionsMetaDB } from './connections-meta-db.js'
import { BaseWorker } from './base-worker.js'

const TAG = "main"
const URL = '/worker-api/sqlite'

class ConnectionWorker extends BaseWorker {
    async handleMessage(m) {
        this.logger.log(TAG, JSON.stringify(m.data));
        switch (m.data.type) {
            case Constants.CONNECTION_SAVED:
            case Constants.CONNECTION_DELETED:
                this.syncUp();
                break
        }
    }

    async init() {
        await super.init();
        this.logger.log(TAG, "db:" + this.db);

        this.connectionDb = new ConnectionDB(this.logger, {version: Constants.CONN_DB_VERSION});
        await this.connectionDb.open();

        this.metaDB = new ConnectionsMetaDB(this.logger, {version: Constants.CONNECTIONS_META_DB_VERSION});
        await this.metaDB.open();
        this.logger.log(TAG, "metadb.get: " + await this.metaDB.get());

        this.syncDown();
        this.syncUp();
    }

    async syncDown() {
        let conns = await this.connectionDb.getAll();

        let after = await this.metaDB.getLastSyncTs();
        after = after.toISOString();
        this.logger.log(TAG, `after: ${after}`);

        let res = await Utils.get(`${URL}/connections/updated`, false, {
            db: this.db,
            after: after
        });

        this.logger.log(TAG, "Sync down: " + JSON.stringify(res));

        if (res.status != "ok") {
            this.logger.log(TAG, "Sync down error: " + res.msg);
            return;
        }

        let updateUI = false;
        conns = res.data.connections ?? [];

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
                conns[i].db_id = conns[i].id
                delete conns[i].id;

                conns[i].synced_at = new Date();
                conns[i].created_at = new Date(conns[i].created_at)
                conns[i].updated_at = new Date(conns[i].updated_at)

                let id = await this.connectionDb.save(conns[i]);
                this.logger.log(TAG, `saved to : ${id}`);
                if (id >= 1) {
                    updateUI = true;
                }
            } else {
                //nope. may be is-default got updated..
                await this.connectionDb.put(c.id, c.pass, conns[i].is_default);
                await this.connectionDb.sync(c);
                updateUI = true;
                this.logger.log(TAG, `Updated ${c.id}`);
            }
        }

        if (updateUI) {
            this.port.postMessage({
                type: Constants.NEW_CONNECTIONS,
            })
        }

        this.logger.log(TAG, "Setting last_sync_ts");
        await this.metaDB.setLastSyncTs();
        this.logger.log(TAG, "Done last_sync_ts");
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
            let updatedAt = conns[i].updated_at ?? new Date(Constants.EPOCH_TIMESTAMP);

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
                    db: this.db,
                    'Content-Type': 'application/json',
                }
            });

            res = await res.json();
            this.logger.log(TAG, JSON.stringify(res));

            if (res.status == "ok") {
                conns[i].db_id = res.data.db_id;
                this.logger.log(TAG, `syncing: ${JSON.stringify(conns[i])}`);
                this.connectionDb.sync(conns[i])
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
                db: this.db,
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
