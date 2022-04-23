import { Constants } from './constants.js'
import { Logger } from './logger.js'
import { PubSub } from './pubsub.js'
import { DbUtils } from './dbutils.js'
import { Utils } from './utils.js'
import { DbMenu } from './db-menu/main.js'

const TAG = "appbar"
class AppBar {
    constructor(name, sessionId, db) {
        this.sessionId = sessionId;
        this.db = db;
        document.title = this.db;
        this.dbMenu = new DbMenu(this.sessionId, this.db);

        this.$databases = document.getElementById('databases');
        document.getElementById('conn-name').innerHTML = `${name}&nbsp;&nbsp;&nbsp;`;

        this.showDatabases();

        this.$databases.addEventListener('change', () => {
            this.db = this.$databases.value;
            Logger.Log(TAG, "Db changed to " + this.db);

            this.dbMenu.setSessionInfo(this.sessionId, this.db);
            document.title = this.db;
            PubSub.publish(Constants.DB_CHANGED, {db: this.db});
        })

        PubSub.subscribe(Constants.DB_RENAMED, async (data) => {
            Logger.Log(TAG, "Db renamed");
            this.db = data['new-db'];
            await this.showDatabases();
            this.$databases.dispatchEvent(new Event('change'));
        });

        PubSub.subscribe(Constants.DB_DELETED, async (data) => {
            Logger.Log(TAG, "Db deleted");
            this.db = '';
            await this.showDatabases();
            this.$databases.dispatchEvent(new Event('change'));
        });
    }

    async showDatabases() {
        let dbs = await DbUtils.fetchAll(this.sessionId, 'show databases');
        dbs = Utils.extractColumns(dbs);
        Utils.setOptions(this.$databases, dbs, this.db);
    }

    setSessionInfo(sessionId) {
        this.sessionId = sessionId;
    }
}

export { AppBar }
