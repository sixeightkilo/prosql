import { Log } from './modules/logger.js'
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

const TAG = "content"
class Content {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.init()
            this.adjustView()
            this.history = new QueryHistory();
            MainMenu.init();
        })
    }

    async initHandlers() {
        PubSub.subscribe(Constants.DB_CHANGED, async (data) => {
            Log(TAG, "Db changed");
            this.creds.db = data.db
            Utils.saveToSession(Constants.CREDS, JSON.stringify(this.creds))

            //if db has changed we have to create new session
            this.sessionId = await DbUtils.login(this.creds)

            //update session id in all modules
            this.tableContents.setSessionInfo(this.sessionId, this.creds.db)
            this.tables.setSessionInfo(this.sessionId, this.creds.db)

            this.tables.show(this.creds.db)
        })

        this.$tables = document.getElementById('tables')

        PubSub.subscribe(Constants.TABLE_SELECTED, (data) => {
            this.tableContents.reset();
            this.tableContents.show(data.table);
        });
    }

    async init() {
        this.tableContents = new TableContents(this.sessionId)
        this.tables = new Tables(this.sessionId)

        this.initHandlers()

        let creds = Utils.getFromSession(Constants.CREDS)
        if (!creds) {
            window.location = '/login';
            return
        }

        this.creds = JSON.parse(creds)
        this.sessionId = await DbUtils.login(this.creds)

        Log(TAG, this.sessionId)

        AppBar.init(this.creds.name, this.sessionId, this.creds.db);

        if (this.creds.db) {
            this.tableContents.setSessionInfo(this.sessionId, this.creds.db)
            this.tables.setSessionInfo(this.sessionId, this.creds.db)
            this.tables.show(this.creds.db);
        }

        let $g1 = document.getElementById('app-content');
        let $e1 = document.getElementById('app-left-panel-container');
        let $e2 = document.getElementById('app-right-panel');
        let $resizer = document.getElementById('app-content-resizer');
        new GridResizerH($g1, $e1, $resizer, $e2);
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
