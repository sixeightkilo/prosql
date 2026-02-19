const TAG = 'WorkerSqliteConnections';

export default class WorkerSqliteConnections {

    constructor(logger, db) {
        this.logger = logger;
        this.db = db;
    }

    handle = async (req, res, next) => {
        try {
            if (req.method === 'POST') {
                return this.handlePost(req, res);
            }

            if (req.method === 'DELETE') {
                return this.handleDelete(req, res);
            }

            return this.handleGet(req, res);

        } catch (err) {
            next(err);
        }
    };

    /* =======================
       GET
    ======================= */

    handleGet(req, res) {
        const owner = req.header('db');
        const after = req.header('after') || '1970-01-01 00:00:00';

        this.logger.info(TAG, `GET owner=${owner} after=${after}`);

        const stmt = this.db.prepare(`
            SELECT a.id, a.name, a.user, a.host, a.port,
                   a.db, a.is_default,
                   b.status,
                   a.created_at, a.updated_at
            FROM connections a
            INNER JOIN statuses b ON a.status = b.id
            WHERE a.owner = ?
              AND a.updated_at > datetime(?)
        `);

        const rows = stmt.all(owner, after);

        res.json({
            status: 'ok',
            data: { connections: rows }
        });
    }

    /* =======================
       POST
    ======================= */

    handlePost(req, res) {
        const owner = req.header('db');
        const c = req.body;

        this.logger.info(TAG, `POST owner=${owner} name=${c.name}`);

        const insert = this.db.prepare(`
            INSERT INTO connections
            (owner, name, user, host, port, db, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(owner, name, user, host, port, db)
            DO UPDATE SET
                is_default = excluded.is_default,
                status = 100,
                updated_at = CURRENT_TIMESTAMP
        `);

        const result = insert.run(
            owner,
            c.name,
            c.user,
            c.host,
            c.port,
            c.db,
            c.is_default ? 1 : 0
        );

        let id = result.lastInsertRowid;

        if (!id) {
            const select = this.db.prepare(`
                SELECT id FROM connections
                WHERE owner = ?
                  AND name = ?
                  AND user = ?
                  AND host = ?
                  AND port = ?
                  AND db = ?
            `);

            const row = select.get(
                owner,
                c.name,
                c.user,
                c.host,
                c.port,
                c.db
            );

            id = row?.id ?? null;
        }

        res.json({
            status: 'ok',
            data: { db_id: id }
        });
    }

    /* =======================
       DELETE
    ======================= */

    handleDelete(req, res) {
        const owner = req.header('db');
        const ids = req.body;

        this.logger.info(TAG, `DELETE owner=${owner} ids=${ids}`);

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                status: 'error',
                msg: 'invalid-input'
            });
        }

        const placeholders = ids.map(() => '?').join(',');

        const stmt = this.db.prepare(`
            UPDATE connections
            SET status = 200,
                updated_at = CURRENT_TIMESTAMP
            WHERE owner = ?
              AND id IN (${placeholders})
        `);

        stmt.run(owner, ...ids);

        res.json({
            status: 'ok',
            data: { ids }
        });
    }
}

