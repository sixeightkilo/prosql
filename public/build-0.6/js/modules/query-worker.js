import { Utils } from './utils.js'
import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { QueryDB } from './query-db.js'
import { QueriesMetaDB } from './queries-meta-db.js'
import { BaseWorker } from './base-worker.js'

const TAG = "main"
const URL = '/browser-api/sqlite'
const LIMIT = 50;

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
        await super.init();
        this.logger.log(TAG, "deviceid:" + this.deviceId);

        this.queryDb = new QueryDB(this.logger, {version: Constants.QUERY_DB_VERSION});
        await this.queryDb.open();

        this.metaDB = new QueriesMetaDB(this.logger, {version: Constants.QUERIES_META_DB_VERSION});
        await this.metaDB.open();

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
    }

    async syncDown() {
        this.logger.log(TAG, "syncDown");
        let after = await this.getLastSyncTs(this.metaDB, Constants.QUERIES_META_KEY);
        after = after.toISOString();
        this.logger.log(TAG, `after: ${after}`)

        let updateUI = false;

        let offset = 0;
        do {
            let res = await this.fetchRecs(after, LIMIT, offset);
            this.logger.log(TAG, `${JSON.stringify(res)}`);
            if (res.status == "error") {
                this.logger.log(TAG, "Syncdown error: " + res.msg)
                return;
            }

            let queries = res.data.queries ?? [];

            if (queries.length == 0) {
                break;
            }

            for (let i = 0; i < queries.length; i++) {
                //check if the remote query is already present in local db
                this.logger.log(TAG, `syncDown: ${i}`);
                let q = await this.queryDb.findByDbId(queries[i].id)

                //this may be deleted on the server. Handle this first
                if (queries[i].status == "deleted") {
                    await this.deleteRec(q);
                    updateUI = true;
                    continue;
                }

                //this looks like a new query
                if (q == null) {
                    let id = await this.insertRec(queries[i]);
                    if (id >= 1) {
                        updateUI = true;
                    }
                } else {
                    //nope. may be tags got updated
                    await this.updateRec(q, queries[i].tags);
                    updateUI = true;
                }
            }

            offset += LIMIT;
        } while (true);

        if (updateUI) {
            this.port.postMessage({
                type: Constants.NEW_QUERIES,
            })
        }

        this.setLastSyncTs(this.metaDB, Constants.QUERIES_META_KEY);
    }

    async fetchRecs(after, limit, offset) {
        return await Utils.fetch(`${URL}/queries/updated`, false, {
            db: this.deviceId,
            after: after,
            limit: limit,
            offset: offset
        });
    }

    async insertRec(rec) {
        this.logger.log(TAG, `inserting: ${JSON.stringify(rec.id)}`)
        rec.db_id = rec.id
        delete rec.id;

        rec.synced_at = new Date();

        let id = await this.queryDb.save(rec);
        this.logger.log(TAG, `saved to : ${id}`);
        return id
    }

    async updateRec(q, tags) {
        q.tags = tags;
        await this.queryDb.updateTags(q);
        await this.queryDb.sync(q);
        this.logger.log(TAG, `Updated ${q.id}`);
    }

    async deleteRec(q) {
        if (q == null) {
            this.logger.log(TAG, `already deleted`);
            return;
        }

        this.logger.log(TAG, `deleting: ${JSON.stringify(q)}`)
        await this.queryDb.del(q.id);
    }
}
export { QueryWorker }
