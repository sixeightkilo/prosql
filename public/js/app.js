import { Log } from './modules/logger.js'
import { Err } from './modules/error.js'
import { Utils } from './modules/utils.js'
import { DbUtils } from './modules/dbutils.js'
import { Constants } from './modules/constants.js'
import { TableContents } from './modules/table-contents.js'
import { Tables } from './modules/tables.js'
import { QueryManager } from './modules/query-manager.js'
import { GridResizerH } from './modules/grid-resizer-h.js'
import { PubSub } from './modules/pubsub.js'

const TAG = "app"
class App {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.init()
        })
    }

    async initHandlers() {
        this.$databases = document.getElementById('databases')

        this.$databases.addEventListener('change', async () => {
            //update db in creds
            let db = this.$databases.value
            this.creds.db = db 
            Utils.saveToSession(Constants.CREDS, JSON.stringify(this.creds))

            //if db has changed we have to create new session
            this.sessionId = await DbUtils.login(this.creds)

            //update session id in all modules
            this.tableContents.setSessionInfo(this.sessionId, db)
            this.tables.setSessionInfo(this.sessionId, db)
            this.queryManager.setSessionInfo(this.sessionId, db)

            this.tables.show(db)
        })

        this.$tables = document.getElementById('tables')

        PubSub.subscribe(Constants.TABLE_SELECTED, (data) => {
            this.tableContents.show(data.table);
            this.selectedTable = data.table;
        });

        let elementsArray = document.querySelectorAll('[id$="-menu"]');

        elementsArray.forEach((elem) => {
            elem.addEventListener("click", (e) => {
                Log(TAG, `${e.currentTarget.id} clicked `)
                this.handleMenu(e.currentTarget.id)
            });
        });
    }

    async handleMenu(id) {
        switch (id) {
            case 'query-menu':
                this.tableContents.disable()
                this.queryManager.enable()
                break;

            case 'content-menu':
                this.queryManager.disable()
                this.tableContents.enable()
                if (this.selectedTable) {
                    this.tableContents.show(this.selectedTable)
                }
                break;
        }
    }

    async init() {
        this.queryManager = new QueryManager(this.sessionId)
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

        this.showDatabases()

        let $g1 = document.getElementById('app-content');
        let $e1 = document.getElementById('app-left-panel-container');
        let $e2 = document.getElementById('app-right-panel');
        let $resizer = document.getElementById('app-content-resizer');
        new GridResizerH($g1, $e1, $resizer, $e2);

        //debug
        //this.queryManager.enable()
    }

    async showDatabases() {
        let dbs = await DbUtils.fetchAll(this.sessionId, 'show databases')
        Utils.setOptions(this.$databases, dbs, '')
    }
}

new App()
