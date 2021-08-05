import { Log } from './modules/logger.js'
import { Err } from './modules/error.js'
import { Utils } from './modules/utils.js'
import { DbUtils } from './modules/dbutils.js'
import { Constants } from './modules/constants.js'
import { GridResizerH } from './modules/grid-resizer-h.js'
import { PubSub } from './modules/pubsub.js'
import { QueryRunner } from './modules/query-runner.js'
import { QueryFinder } from './modules/query-finder.js'
import { QueryHistory } from './modules/query-history.js'
import { MainMenu } from './modules/main-menu.js'


const TAG = "query"
class Query {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.adjustView();
            this.init();
            MainMenu.init();
        })
    }

    async initHandlers() {
        this.$databases = document.getElementById('databases')

        this.$databases.addEventListener('change', async () => {
            Log(TAG, "Db changed");
            //update db in creds
            let db = this.$databases.value;
            this.creds.db = db;
            Utils.saveToSession(Constants.CREDS, JSON.stringify(this.creds));

            //if db has changed we have to create new session
            this.sessionId = await DbUtils.login(this.creds);

            //update session id in modules
            this.queryRunner.setSessionInfo(this.sessionId, db);
        })
    }

    async init() {
        this.queryRunner = new QueryRunner(this.sessionId);
        this.history = new QueryHistory();
        this.finder = new QueryFinder();

        this.initHandlers();

        let creds = Utils.getFromSession(Constants.CREDS);
        if (!creds) {
            window.location = '/login';
            return;
        }

        this.creds = JSON.parse(creds);
        this.sessionId = await DbUtils.login(this.creds);

        Log(TAG, this.sessionId);

        this.showDatabases(this.creds.db);

        if (this.creds.db) {
            this.queryRunner.setSessionInfo(this.sessionId, this.creds.db);
        }

        let $g1 = document.getElementById('app-content');
        let $e1 = document.getElementById('app-left-panel-container');
        let $e2 = document.getElementById('app-right-panel');
        let $resizer = document.getElementById('app-content-resizer');
        new GridResizerH($g1, $e1, $resizer, $e2);
    }

    async showDatabases(db) {
        let dbs = await DbUtils.fetchAll(this.sessionId, 'show databases');
        Utils.setOptions(this.$databases, dbs, db);
    }

    adjustView() {
        let queries = document.querySelector('#queries');
        let terms = document.querySelector('#term-container');
        let tags = document.querySelector('#tags-container');
        let appLeftPanel = document.querySelector('#app-left-panel');
        Log(TAG, `q: ${queries.offsetHeight} term: ${terms.offsetHeight} tag: ${tags.offsetHeight} 
                    alp: ${appLeftPanel.offsetHeight}`);
        
        queries.style.height = (appLeftPanel.offsetHeight - terms.offsetHeight - tags.offsetHeight) + 'px';
    }
}

new Query()
