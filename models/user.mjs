export default class User {
    static GUEST_EMAIL = '__guest__';
    static MAX_GUEST_DAYS = 15;

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
}
