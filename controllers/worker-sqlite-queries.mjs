const TAG = 'WorkerSqliteQueries';

export default class WorkerSqliteQueries {

    constructor(logger, db) {
        this.logger = logger;
        this.db = db;
    }

    handle = (req, res, next) => {
        try {
            if (req.method === 'POST') {
                return this.handlePost(req, res);
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
        const limit = parseInt(req.header('limit') || '100');
        const offset = parseInt(req.header('offset') || '0');

        this.logger.info(TAG, `GET owner=${owner} after=${after}`);

        const stmt = this.db.prepare(`
            SELECT q.id,
                   q.query,
                   t.tag,
                   q.created_at,
                   q.updated_at
            FROM queries q
            LEFT JOIN tags t
              ON q.id = t.query_id
             AND q.owner = t.owner
            INNER JOIN statuses s
              ON q.status = s.id
            WHERE q.owner = ?
              AND q.updated_at > datetime(?)
            ORDER BY q.updated_at
            LIMIT ? OFFSET ?
        `);

        const rows = stmt.all(owner, after, limit, offset);

        const map = new Map();

        for (const row of rows) {
            if (!map.has(row.id)) {
                map.set(row.id, {
                    id: row.id,
                    query: row.query,
                    tags: [],
                    created_at: row.created_at,
                    updated_at: row.updated_at
                });
            }

            if (row.tag) {
                map.get(row.id).tags.push(row.tag);
            }
        }

        res.json({
            status: 'ok',
            data: { queries: Array.from(map.values()) }
        });
    }

    /* =======================
       POST
    ======================= */

    handlePost(req, res) {
        const owner = req.header('db');
        const q = req.body;

        this.logger.info(TAG, `POST owner=${owner}`);

        const tx = this.db.db.transaction(() => {

            // Insert or update query
            const insertQuery = this.db.prepare(`
                INSERT INTO queries (owner, query)
                VALUES (?, ?)
                ON CONFLICT(owner, query)
                DO UPDATE SET
                    status = 100,
                    updated_at = CURRENT_TIMESTAMP
            `);

            const result = insertQuery.run(owner, q.query);

            let id = result.lastInsertRowid;

            if (!id) {
                const row = this.db.prepare(`
                    SELECT id FROM queries
                    WHERE owner = ? AND query = ?
                `).get(owner, q.query);

                id = row?.id;
            }

            // Insert tags
            if (Array.isArray(q.tags)) {
                this.logger.info(TAG, `Inserting tags for owner=${owner}, query_id=${id}: ${q.tags.join(',')}`);

                const insertTag = this.db.prepare(`
                    INSERT INTO tags (owner, query_id, tag)
                    VALUES (?, ?, ?)
                    ON CONFLICT(owner, query_id, tag)
                    DO UPDATE SET
                        updated_at = CURRENT_TIMESTAMP
                `);

                for (const tag of q.tags) {
                    insertTag.run(owner, id, tag);
                }
            }

            return id;
        });

        const id = tx();

        res.json({
            status: 'ok',
            data: { db_id: id }
        });
    }
}

