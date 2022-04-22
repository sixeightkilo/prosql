import { Logger } from './modules/logger.js'
import { Err } from './modules/error.js'
import { Utils } from './modules/utils.js'
import { DbUtils } from './modules/dbutils.js'
import { Constants } from './modules/constants.js'
import { TableContents } from './modules/table-contents.js'
import { Tables } from './modules/tables.js'
import { GridResizerH } from './modules/grid-resizer-h.js'
import { PubSub } from './modules/pubsub.js'
import { MainMenu } from './modules/main-menu.js'
import { AppBar } from './modules/appbar.js'
import { QueryHistory } from './modules/query-history.js'
import { Workers } from './modules/workers.js'
import { OpsMenu } from './modules/ops-menu/main.js'

const TAG = "tables"
const TABLES_GRID_DIMENTIONS = "tables-grid-dimensions"

class Content {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.adjustView()
            this.init()
        })

        Utils.saveToSession(Constants.CURRENT_PAGE, TAG);
    }

    async initHandlers() {
        PubSub.subscribe(Constants.DB_CHANGED, async (data) => {
            Logger.Log(TAG, "Db changed");
            this.creds.db = data.db
            Utils.saveToSession(Constants.CREDS, JSON.stringify(this.creds))

            //if db has changed we have to create new session
            this.sessionId = await DbUtils.login(this.creds)

            //update session id in all modules
            this.setSessionInfo();

            this.tables.show(this.creds.db)
        })

        this.$tables = document.getElementById('tables')

        PubSub.subscribe(Constants.TABLE_SELECTED, (data) => {
            this.tableContents.reset();
            this.tableContents.show(data.table);
        });

        PubSub.subscribe(Constants.GRID_H_RESIZED, (data) => {
            Utils.saveToSession(TABLES_GRID_DIMENTIONS, JSON.stringify(data)); 
        });

        PubSub.subscribe(Constants.SIGNIN_REQUIRED, async () => {
            window.location = '/signin';
        });

        PubSub.subscribe(Constants.QUERY_SAVED, async () => {
            this.workers.queryWorker.port.postMessage({
                type: Constants.QUERY_SAVED
            });
        });
    }

    setSessionInfo() {
        this.tableContents.setSessionInfo(this.sessionId, this.creds.db)
        this.tables.setSessionInfo(this.sessionId, this.creds.db)
        this.opsMenu.setSessionInfo(this.sessionId, this.creds.db)
        this.appbar.setSessionInfo(this.sessionId);
    }

    async init() {
        MainMenu.init();
        this.history = new QueryHistory();

        let creds = Utils.getFromSession(Constants.CREDS)
        if (!creds) {
            window.location = '/connections';
            return
        }

        Logger.Log(TAG, JSON.stringify(creds));

        this.creds = JSON.parse(creds);
        this.sessionId = await DbUtils.login(this.creds);
        Logger.Log(TAG, this.sessionId);

        this.tableContents = new TableContents(this.sessionId);
        this.tables = new Tables(this.sessionId);
        this.opsMenu = new OpsMenu(this.sessionId);
        this.appbar = new AppBar(this.creds.name, this.sessionId, this.creds.db);

        this.initHandlers();

        if (this.creds.db) {
            this.setSessionInfo();

            this.tables.show(this.creds.db);
        }

        let $g1 = document.getElementById('app-content');
        let $e1 = document.getElementById('app-left-panel-container');
        let $e2 = document.getElementById('app-right-panel');
        let $resizer = document.getElementById('app-content-resizer');
        let grid = new GridResizerH($g1, $e1, $resizer, $e2);
        let dims = Utils.getFromSession(TABLES_GRID_DIMENTIONS);
        if (dims != null) {
            grid.set(JSON.parse(dims));
        }

        this.workers = new Workers();
        this.workers.initQueryWorker();
        this.workers.initConnectionWorker();
    }

    adjustView() {
        let bodyDims = document.querySelector('body').getBoundingClientRect();
        let appbarDims = document.querySelector('#appbar').getBoundingClientRect();
        let appLeftPanel = document.querySelector('#app-left-panel');
        appLeftPanel.style.height = (bodyDims.height - appbarDims.height) + 'px';

        let appRightPanel = document.getElementById('app-right-panel');
        appRightPanel.style.height = (bodyDims.height - appbarDims.height) + 'px';
    }
}

new Content()
