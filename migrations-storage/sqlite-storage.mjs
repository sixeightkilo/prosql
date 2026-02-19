export default class SqliteMigrationStorage {
    constructor(db) {
        this.db = db;

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS migrations (
                name TEXT PRIMARY KEY,
                executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    async executed() {
        const rows = this.db.prepare(
            `SELECT name FROM migrations ORDER BY executed_at`
        ).all();

        return rows.map(r => r.name);
    }

    async logMigration({ name }) {
        this.db.prepare(
            `INSERT INTO migrations (name) VALUES (?)`
        ).run(name);
    }

    async unlogMigration({ name }) {
        this.db.prepare(
            `DELETE FROM migrations WHERE name = ?`
        ).run(name);
    }
}
