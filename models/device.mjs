const TAG = 'DeviceModel';
export default class Device {
    static TIMESTAMP_FORMAT = 'Y-m-d H:i:s'; // semantic marker only

    constructor(logger, db) {
        this.logger = logger;
        this.db = db;
    }

    save(data) {
        const stmt = this.db.prepare(`
            INSERT INTO devices (device_id, version, os, created_at)
            VALUES (@device_id, @version, @os, datetime('now'))
            ON CONFLICT(device_id) DO UPDATE SET
                version = excluded.version,
                os = excluded.os
        `);

        const info = stmt.run({
            device_id: data.device_id,
            version: data.version,
            os: data.os
        });

        // match PHP: return numeric row id
        if (info.lastInsertRowid) {
            return info.lastInsertRowid;
        }

        // fetch existing id on update
        const row = this.db
            .prepare(`SELECT id FROM devices WHERE device_id = ?`)
            .get(data.device_id);

        return row.id;
    }

    get(fields, conditions) {
        const fieldList = fields.join(', ');

        const where = conditions
            .map(([col, op]) => `${col} ${op} ?`)
            .join(' AND ');

        const values = conditions.map(c => c[2]);

        const sql = `
            SELECT ${fieldList}
            FROM devices
            WHERE ${where}
        `;

        return this.db.prepare(sql).all(...values);
    }

    getByDeviceId(deviceId) {
        this.logger.info(TAG, `Fetching device by device_id: ${deviceId}`);
        return this.db .prepare(`SELECT * FROM devices WHERE device_id = ?`) .get(deviceId); 
    }

    setUserId(deviceId, userId) {  
        this.db.prepare(`
            UPDATE devices
            SET user_id = ?
            WHERE device_id = ?
        `).run(userId, deviceId);
    }
}

