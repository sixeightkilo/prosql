import Database from 'better-sqlite3';

export default class SqliteDB {
    constructor(dbPath, logger) {
        this.logger = logger;
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');
    }

    prepare(sql) {
        return this.db.prepare(sql);
    }

    exec(sql) {
        return this.db.exec(sql);
    }
}

