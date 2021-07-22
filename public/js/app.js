import { Log } from './modules/logger.js'
import { Err } from './modules/error.js'
import { Utils } from './modules/utils.js'
import { DbUtils } from './modules/dbutils.js'
import { Constants } from './modules/constants.js'
import { TableContents } from './modules/table-contents.js'
import { Tables } from './modules/tables.js'
import { QueryRunner } from './modules/query-runner.js'
import { QueryHistory } from './modules/query-history.js'
import { QueryFinder } from './modules/query-finder.js'
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
            Log(TAG, "Db changed");
            //update db in creds
            let db = this.$databases.value
            this.creds.db = db 
            Utils.saveToSession(Constants.CREDS, JSON.stringify(this.creds))

            //if db has changed we have to create new session
            this.sessionId = await DbUtils.login(this.creds)

            //update session id in all modules
            this.tableContents.setSessionInfo(this.sessionId, db)
            this.tables.setSessionInfo(this.sessionId, db)
            this.queryRunner.setSessionInfo(this.sessionId, db)

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
                this.tableContents.disable();
                this.finder = new QueryFinder();
                this.queryRunner.enable();
                break;

            case 'content-menu':
                this.queryRunner.disable()

                //restore table view
                this.tables = new Tables(this.sessionId)
                this.tables.show(this.creds.db);

                this.tableContents.enable()
                if (this.selectedTable) {
                    this.tableContents.show(this.selectedTable)
                }
                break;

            case 'full-screen-menu':
                this.toggleFullScreen();
                break;
        }
    }

	toggleFullScreen() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	}

    async init() {
        this.history = new QueryHistory();
        this.queryRunner = new QueryRunner(this.sessionId)
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

        this.showDatabases(this.creds.db)
        if (this.creds.db) {
            this.tableContents.setSessionInfo(this.sessionId, this.creds.db)
            this.tables.setSessionInfo(this.sessionId, this.creds.db)
            this.queryRunner.setSessionInfo(this.sessionId, this.creds.db)

            this.tables.show(this.creds.db);
        }

        let $g1 = document.getElementById('app-content');
        let $e1 = document.getElementById('app-left-panel-container');
        let $e2 = document.getElementById('app-right-panel');
        let $resizer = document.getElementById('app-content-resizer');
        new GridResizerH($g1, $e1, $resizer, $e2);

        //debug
        //this.queryRunner.enable()
    }

    async showDatabases(db) {
        let dbs = await DbUtils.fetchAll(this.sessionId, 'show databases')
        Utils.setOptions(this.$databases, dbs, db);
    }
}

new App()
