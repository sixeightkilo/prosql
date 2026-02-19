import { Umzug } from 'umzug';
import SqliteDB from './db/sqlite.mjs';
import SqliteMigrationStorage from './migrations-storage/sqlite-storage.mjs';
import logger from './logger.mjs';
import 'dotenv/config';

const db = new SqliteDB(
    {
        dir: process.env.DB_PATH,
        file: 'prosql.db'
    },
    logger
);

const umzug = new Umzug({
    migrations: {
        glob: 'migrations/*.mjs'
    },
    context: db,
    storage: new SqliteMigrationStorage(db),
    logger: console
});

const command = process.argv[2];

if (command === 'up') {
    await umzug.up();
    console.log('Migrations applied');
} else if (command === 'down') {
    await umzug.down();
    console.log('Migration reverted');
} else if (command === 'status') {
    console.log('Executed:', await umzug.executed());
    console.log('Pending:', await umzug.pending());
} else {
    console.log('Usage: node migrate.mjs up|down|status');
}
