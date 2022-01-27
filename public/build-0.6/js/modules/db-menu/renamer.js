import { Logger } from './../logger.js'
import { Constants } from './../constants.js'
import { PubSub } from './../pubsub.js'
import { Utils } from './../utils.js'
import { DbUtils } from './../dbutils.js'
import ProgressBar from './../progress-bar.js'

const TAG = "db-renamer"

class Renamer {
    constructor(sessionId) {
        this.sessionId = sessionId;

        this.$dialog = document.getElementById('db-renamer-dialog');
        this.$cancel = this.$dialog.querySelector('.cancel');
        this.$ok = this.$dialog.querySelector('.ok');
        this.$body = this.$dialog.querySelector('.modal-card-body');
        this.$title = this.$dialog.querySelector('.modal-card-title');
        this.$name = this.$dialog.querySelector('#new-db-name');

        this.$ok.addEventListener('click', async () => {
            //close the initial dialog and display a progress dialog
            this.closeDialog();
            ProgressBar.setOptions({});//no buttons
            PubSub.publish(Constants.INIT_PROGRESS, {});
            PubSub.publish(Constants.START_PROGRESS, {});

            try {
                let attribs = await this.getCurrentDbAttribs();
                PubSub.publish(Constants.UPDATE_PROGRESS, {
                    message: `Renaming ${this.db} to ${this.$name.value}`
                });

                Logger.Log(TAG, `Renaming ${this.db} to ${this.$name.value}`);

                await this.createNewDb(this.$name.value, attribs);
                Logger.Log(TAG, "Created new DB");
                PubSub.publish(Constants.UPDATE_PROGRESS, {
                    message: `Created ${this.$name.value}`
                });

                await this.renameTables(this.db, this.$name.value);
                Logger.Log(TAG, "Renamed tables");
                PubSub.publish(Constants.UPDATE_PROGRESS, {
                    message: `Renamed tables`
                });

                PubSub.publish(Constants.DB_RENAMED, {
                    'new-db': this.$name.value
                });
            } catch (e) {
                Logger.Log(TAG, "Error: " + e)
            } finally {
                PubSub.publish(Constants.STOP_PROGRESS, {});
            }
        });

        this.$cancel.addEventListener('click', () => {
            //if no query in progress this will be ignored
            DbUtils.cancel(this.sessionId, this.cursorId);
            this.closeDialog();
        });
    }

    async getCurrentDbAttribs() {
        let rows = await DbUtils.fetchAll(this.sessionId, 
            `SELECT default_character_set_name, default_collation_name FROM information_schema.SCHEMATA
            WHERE schema_name = "${this.db}"`);
        return {
            'charset': rows[0][1],
            'collation': rows[0][3],
        };
    }

    async renameTables(oldDb, newDb) {
        let tables = await DbUtils.fetchAll(this.sessionId, `show tables from \`${oldDb}\``);
        let dbUtils = new DbUtils();

        for (let i = 0; i < tables.length; i++) {
            Logger.Log(TAG, tables[i][1]);
            let t = tables[i][1];
            let query = `rename table \`${oldDb}\`.\`${t}\` to \`${newDb}\`.\`${t}\``;
            let res = await dbUtils.execute.apply(this, [query]);
            if (res.status != "ok") {
                throw `${res.msg}`;
            }

            PubSub.publish(Constants.UPDATE_PROGRESS, {
                message: `Renamed ${t}`
            });
        }
    }

    async createNewDb(name, attribs) {
        let query = `create database if not exists \`${name}\` 
            character set ${attribs.charset} collate ${attribs.collation}`;

        let dbUtils = new DbUtils();
        let res = await dbUtils.execute.apply(this, [query]);
        if (res.status != "ok") {
            throw `${res.msg}`;
        }
    }

    async deleteOldDb(db) {
        let query = `drop database \`${db}\``;

        let dbUtils = new DbUtils();
        let res = await dbUtils.execute.apply(this, [query]);
        if (res.status != "ok") {
            throw `${res.msg}`;
        }
    }

    openDialog() {
        this.$dialog.classList.add('is-active');
    }

    closeDialog() {
        this.$dialog.classList.remove('is-active');
    }

    setSessionInfo(sessionId, db) {
        this.sessionId = sessionId;
        this.db = db;
    }

    init(db) {
        this.db = db;
        this.title = `Rename ${this.db} to:`;
        this.$title.innerHTML = this.title;
        this.$name.value = '';
        this.openDialog();
    }

    reset() {
    }
}

export { Renamer }
