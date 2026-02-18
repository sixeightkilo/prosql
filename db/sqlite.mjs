import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export default class SqliteDB {
    constructor({ dir, file }, logger) {
        this.logger = logger;

        if (!dir || !file) {
            throw new Error('SqliteDB requires { dir, file }');
        }

        // ensure directory exists
        fs.mkdirSync(dir, { recursive: true });

        const fullPath = path.join(dir, file);
        this.logger.info('SqliteDB', `Opening database at ${fullPath}`);

        this.db = new Database(fullPath);

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
