import { Constants } from './constants.js'
import { Logger } from './logger.js'
import { PubSub } from './pubsub.js'
import { DbUtils } from './dbutils.js'
import { Utils } from './utils.js'

const TAG = "appbar"
class AppBar {
    static init(name, sessionId, db) {
        let $databases = document.getElementById('databases');
        document.getElementById('conn-name').innerHTML = name;

        AppBar.showDatabases($databases, sessionId, db);

        $databases.addEventListener('change', () => {
            Logger.Log(TAG, "Db changed");
            let db = $databases.value;
            PubSub.publish(Constants.DB_CHANGED, {db: db});
        })
    }

    static async showDatabases($databases, sessionId, db) {
        let dbs = await DbUtils.fetchAll(sessionId, 'show databases');
        dbs = Utils.extractColumns(dbs);
        Utils.setOptions($databases, dbs, db);
        //PubSub.publish(Constants.DB_CHANGED, {db: db});
    }
}

export { AppBar }
