import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { BaseDB } from './base-db.js'
import { Utils } from './utils.js'
import { ConnectionDB } from './connection-db.js'

const TAG = "connections"

//just a wrapper over connectiondb so we dont have to deal with from/to stuff in 
//client
class Connections extends ConnectionDB {
    constructor(logger, options) {
        super(logger, options);
        this.keys = 
            ConnectionDB.toDbArray(["id", "name", "user", "pass", "host", "port", "db", "is-default", "status"]);
    }

    async getAll() {
        let conns = ConnectionDB.fromDbArray(await super.getAll(this.keys));
        let recs = []

        for (let i = 0; i < conns.length; i++) {
            let isDeleted = ((conns[i].status ?? Constants.STATUS_ACTIVE) == Constants.STATUS_DELETED) ? true : false;
            this.logger.log(TAG, `${conns[i].id}: ${conns[i].status}: ${isDeleted}`);

            if (isDeleted) {
                continue;
            }

            //status not needed by clients
            delete conns[i].status;
            recs.push(conns[i]);
        }

        return recs;
    }

    async get(id) {
        let r = ConnectionDB.fromDb(await super.get(id, this.keys));
        delete r.status;
        return r;
    }

    async save(conn) {
        return await(super.save(ConnectionDB.toDb(conn)));
    }
} 

export { Connections }
