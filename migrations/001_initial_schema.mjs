export const up = async ({ context: db }) => {
    db.exec(`PRAGMA foreign_keys = ON;`);

    const UTC_TS = "DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))";

    /* =========================
       STATUSES
    ========================== */
    db.exec(`
        CREATE TABLE IF NOT EXISTS statuses (
            id INTEGER PRIMARY KEY,
            status TEXT NOT NULL UNIQUE
        );

        INSERT OR IGNORE INTO statuses (id, status) VALUES
            (100, 'active'),
            (200, 'deleted');
    `);

    /* =========================
       USERS
    ========================== */
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL ${UTC_TS},
            updated_at TEXT NOT NULL ${UTC_TS}
        );
    `);

    /* =========================
       DEVICES
    ========================== */
    db.exec(`
        CREATE TABLE IF NOT EXISTS devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_id TEXT NOT NULL UNIQUE,
            user_id INTEGER,
            version TEXT NOT NULL,
            os TEXT NOT NULL,
            created_at TEXT NOT NULL ${UTC_TS},
            updated_at TEXT NOT NULL ${UTC_TS},
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );
    `);

    /* =========================
       QUERIES
    ========================== */
    db.exec(`
        CREATE TABLE IF NOT EXISTS queries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner TEXT NOT NULL,
            query TEXT NOT NULL,
            status INTEGER NOT NULL DEFAULT 100 REFERENCES statuses(id),
            created_at TEXT NOT NULL ${UTC_TS},
            updated_at TEXT NOT NULL ${UTC_TS}
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_queries_owner_query
        ON queries (owner, query);

        CREATE INDEX IF NOT EXISTS idx_queries_owner_updated
        ON queries (owner, updated_at);
    `);

    /* =========================
       TAGS
    ========================== */
    db.exec(`
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner TEXT NOT NULL,
            query_id INTEGER NOT NULL,
            tag TEXT NOT NULL,
            created_at TEXT NOT NULL ${UTC_TS},
            updated_at TEXT NOT NULL ${UTC_TS},
            FOREIGN KEY (query_id) REFERENCES queries(id) ON DELETE CASCADE
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_owner_query_tag
        ON tags (owner, query_id, tag);
    `);

    /* =========================
       CONNECTIONS
    ========================== */
    db.exec(`
        CREATE TABLE IF NOT EXISTS connections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner TEXT NOT NULL,
            name TEXT NOT NULL,
            user TEXT NOT NULL,
            host TEXT NOT NULL,
            port TEXT NOT NULL,
            db TEXT NOT NULL,
            is_default INTEGER NOT NULL DEFAULT 0,
            status INTEGER NOT NULL DEFAULT 100 REFERENCES statuses(id),
            created_at TEXT NOT NULL ${UTC_TS},
            updated_at TEXT NOT NULL ${UTC_TS}
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_connections_owner_unique
        ON connections (owner, name, user, host, port, db);

        CREATE INDEX IF NOT EXISTS idx_connections_owner_status
        ON connections (owner, status);
    `);
};

export const down = async ({ context: db }) => {
    db.exec(`
        DROP TABLE IF EXISTS tags;
        DROP TABLE IF EXISTS queries;
        DROP TABLE IF EXISTS connections;
        DROP TABLE IF EXISTS devices;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS statuses;
    `);
};
