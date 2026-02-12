export default class User {
    static GUEST_EMAIL = '__guest__';
    static MAX_GUEST_DAYS = 15;
    static GUEST_FIRST_NAME = 'Guest';
    static GUEST_LAST_NAME = 'User';

    constructor(logger, db) {
        this.logger = logger;
        this.db = db;
    }

    getByEmail(email) {
        return this.db
            .prepare(`SELECT * FROM users WHERE email = ?`)
            .get(email);
    }

    getById(id) {
        return this.db
            .prepare(`SELECT * FROM users WHERE id = ?`)
            .get(id);
    }

    save(user) {
        const stmt = this.db.prepare(`
            INSERT INTO users (first_name, last_name, email)
            VALUES (?, ?, ?)
            ON CONFLICT(email)
            DO UPDATE SET
            first_name = excluded.first_name,
            last_name = excluded.last_name`);

        const result = stmt.run(
            user.first_name,
            user.last_name,
            user.email
        );

        return result.lastInsertRowid;
    }
}