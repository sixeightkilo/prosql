import { Logger } from './modules/logger.js'
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
import { AppBar } from './modules/appbar.js'

const TAG = "query"
class Query {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.adjustView();
            this.init();
        })
    }

    async initHandlers() {
        PubSub.subscribe(Constants.DB_CHANGED, async (data) => {
            Logger.Log(TAG, "Db changed");
            this.creds.db = data.db;
            Utils.saveToSession(Constants.CREDS, JSON.stringify(this.creds));

            //if db has changed we have to create new session
            this.sessionId = await DbUtils.login(this.creds);

            //update session id in modules
            this.queryRunner.setSessionInfo(this.sessionId, this.creds.db);
        })
    }

    async init() {
        MainMenu.init();

        let creds = Utils.getFromSession(Constants.CREDS);
        if (!creds) {
            window.location = '/login';
            return;
        }

        this.creds = JSON.parse(creds);
        this.sessionId = await DbUtils.login(this.creds);
        Logger.Log(TAG, this.sessionId);

        this.queryRunner = new QueryRunner(this.sessionId);

        this.history = new QueryHistory();
        await this.history.init();

        //this.finder = new QueryFinder();
        //await this.finder.init();

        this.initHandlers();

        AppBar.init(this.creds.name, this.sessionId, this.creds.db);

        if (this.creds.db) {
            this.queryRunner.setSessionInfo(this.sessionId, this.creds.db);
        }

        let $g1 = document.getElementById('app-content');
        let $e1 = document.getElementById('app-left-panel-container');
        let $e2 = document.getElementById('app-right-panel');
        let $resizer = document.getElementById('app-content-resizer');
        new GridResizerH($g1, $e1, $resizer, $e2);

        //this.initWorkers();
    }

    initWorkers() {
        this.$version = document.getElementById('version')
        Logger.Log(TAG, `ver: ${this.$version.value}`);
        const connectionWorker = new SharedWorker(`/build-0.6/dist/js/connection-worker.js?ver=${this.$version.value}`);
        connectionWorker.port.onmessage = (e) => {
            switch (e.data.type) {
                case Constants.DEBUG_LOG:
                    Logger.Log("connection-worker", e.data.payload);
                    break;
            }
        }

        const queryWorker = new SharedWorker(`/build-0.6/dist/js/query-worker.js?ver=${this.$version.value}`);
        queryWorker.port.onmessage = (e) => {
            switch (e.data.type) {
                case Constants.DEBUG_LOG:
                    Logger.Log("query-worker", e.data.payload);
                    break;
            }
        }
    }

    adjustView() {
        let bodyDims = document.querySelector('body').getBoundingClientRect();
        let appbarDims = document.querySelector('#appbar').getBoundingClientRect();
        let appLeftPanel = document.querySelector('#app-left-panel');
        appLeftPanel.style.height = (bodyDims.height - appbarDims.height) + 'px';

        //right panel
        let rpDims = document.getElementById('app-right-panel').getBoundingClientRect();
        let sbDims = document.getElementById('query-sub-menu').getBoundingClientRect();
        let edDims = document.getElementById('query-editor').getBoundingClientRect();

        let h = rpDims.height - sbDims.height - edDims.height;
        h -= 50;
        Logger.Log(TAG, `h: ${h}`);
        let queryContainer = document.querySelector('#query-container');
        queryContainer.style.gridTemplateRows = `200px 2px ${h}px`;
    }
}

new Query()
