import { Utils } from './utils.js'
import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { QueryDB } from './query-db.js'
import { BaseWorker } from './base-worker.js'

const TAG = "main"
const URL = '/browser-api/sqlite'

class QueryWorker extends BaseWorker {
    async handleMessage(m) {
        this.logger.log(TAG, JSON.stringify(m.data));
        switch (m.data.type) {
        case Constants.QUERY_SAVED:
        case Constants.QUERY_UPDATED:
            this.syncUp();
            break
        }
    }

    async init() {
        let res = await Utils.fetch(Constants.URL + '/about', false);
        if (res.status == "error") {
            this.logger.log(TAG, JSON.stringify(res));
            return
        }

        this.deviceId = res.data['device-id'];
        this.logger.log(TAG, "init done");

        this.queryDb = new QueryDB(this.logger, {version: Constants.QUERY_DB_VERSION});
        await this.queryDb.open();

        this.syncDown();
        this.syncUp();
    }

    async syncUp() {
        //find all records missing db_id and sync them up to cloud
        let queries = await this.queryDb.getAll();
        if (queries.length == 0) {
            this.logger.log(TAG, "Nothing to sync");
            return;
        }

        let deleted = [];
        for (let i = 0; i < queries.length; i++) {
            //when we delete from UI, we just mark the status as deleted, then sync up later
            let isDeleted = ((queries[i].status ?? Constants.STATUS_ACTIVE) == Constants.STATUS_DELETED) ? true : false;

            if (isDeleted) {
                this.logger.log(TAG, `Deleting ${queries[i].id}`);
                if (!queries[i].db_id) {
                    //this has not been synced yet. We can safely delete
                    this.queryDb.del(queries[i].id);
                    continue;
                }

                deleted.push(queries[i]);
                continue;
            }

            if (queries[i].db_id) {
                //every record may or may not have updated_at
                let updatedAt = queries[i].updated_at ?? new Date(Constants.EPOCH_TIMESTAMP);

                //if it has a db_id , it is guaranteed to haved synced_at
                if (queries[i].synced_at > updatedAt) {
                    this.logger.log(TAG, `Skipping ${queries[i].id}: ${queries[i].db_id}`);
                    continue;
                }
            }

            let res = await fetch(`${URL}/queries`, {
                body: JSON.stringify(queries[i]),
                method: "POST",
                headers: {
                    db: this.deviceId,
                    'Content-Type': 'application/json',
                }
            });

            res = await res.json();
            this.logger.log(TAG, JSON.stringify(res));

            if (res.status == "ok") {
                queries[i].db_id = res.data.db_id;
                this.logger.log(TAG, `syncing: ${JSON.stringify(queries[i])}`);
                this.queryDb.sync(queries[i])
            }
        }

        //this.syncDeleted(deleted);
    }

    async syncDown() {
        this.logger.log(TAG, "syncDown");
        let queries = await this.queryDb.getAll();

        let res = await Utils.fetch(`${URL}/queries/updated`, false, {
            db: this.deviceId,
            after: await this.getLastSyncTs(queries)
        });

        this.logger.log(TAG, "Sync down: " + JSON.stringify(res));

        if (res.status != "ok") {
            this.logger.log(TAG, "Sync down error: " + res.msg);
            return;
        }

        let updateUI = false;
        queries = res.data.queries

        for (let i = 0; i < queries.length; i++) {
            //check if the remore connection is already present in local db
            this.logger.log(TAG, `syncDown: ${i}`);
            let q = await this.queryDb.findByDbId(queries[i].id)

            //this may be deleted on the server. Handle this first
            if (queries[i].status == "deleted") {
                if (q == null) {
                    this.logger.log(TAG, `already deleted: ${queries[i].id}`)
                    continue;
                }

                this.logger.log(TAG, `deleting: ${JSON.stringify(q)}`)
                await this.queryDb.del(q.id);
                updateUI = true;
                continue;
            }

            //this looks like a new query
            if (q == null) {
                this.logger.log(TAG, `inserting: ${JSON.stringify(queries[i].id)}`)
                queries[i].db_id = queries[i].id
                delete queries[i].id;

                queries[i].synced_at = new Date();
                queries[i].created_at = new Date(queries[i].created_at)
                queries[i].updated_at = new Date(queries[i].updated_at)

                let id = await this.queryDb.save(queries[i]);
                this.logger.log(TAG, `saved to : ${id}`);
                if (id >= 1) {
                    updateUI = true;
                }
            } else {
                //nope. may be tags got updated
                q.tags = queries[i].tags
                await this.queryDb.updateTags(q);
                await this.queryDb.sync(q);
                updateUI = true;
                this.logger.log(TAG, `Updated ${q.id}`);
            }
        }

        if (updateUI) {
            this.port.postMessage({
                type: Constants.NEW_QUERIES,
            })
        }
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
        let res = await fetch(`${URL}/queries`, {
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
            let c = await this.queryDb.findByDbId(res.data.ids[i]);
            await this.queryDb.destroy(c.id);
            this.logger.log(TAG, `Destroyed: ${c.id}`);
        }
    }
}
export { QueryWorker }
