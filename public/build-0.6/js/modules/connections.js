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
        this.keys = ConnectionDB.toDbArray(["id", "name", "user", "pass", "host", "port", "db", "is-default"]);
    }

    async getAll() {
        return ConnectionDB.fromDbArray(await super.getAll(this.keys));
    }

    async get(id) {
            return ConnectionDB.fromDb(await super.get(id, this.keys));
    }

    async save(conn) {
        return await(super.save(ConnectionDB.toDb(conn)));
    }
} 

export { Connections }
