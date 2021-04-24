import { Log } from './modules/logger.js'
import { Err } from './modules/error.js'
import { Utils } from './modules/utils.js'
import { DbUtils } from './modules/dbutils.js'
import { Constants } from './modules/constants.js'
import { TableContents } from './modules/table-contents.js'

const TAG = "app"
class App {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.init()
            this.$databases.addEventListener('change', async () => {
                let db = this.$databases.value
                this.creds.db = db 
                Utils.saveToSession(Constants.CREDS, JSON.stringify(this.creds))

                this.sessionId = await DbUtils.login(this.creds)
                this.tableContents.setSessionId(this.sessionId)
                this.showTables(db)
            })

            this.$tables.addEventListener('click', async (e) => {
                let target = event.target;
                if (target.className != 'table-name') {
                    return
                }
                
                this.tableContents.show(target.innerHTML)
            })
        })
    }

    async init() {
        this.$databases = document.getElementById('databases')
        this.$tables = document.getElementById('tables')

        let creds = Utils.getFromSession(Constants.CREDS)
        if (!creds) {
            window.location = '/login';
            return
        }

        this.creds = JSON.parse(creds)
        this.sessionId = await DbUtils.login(this.creds)

        Log(TAG, this.sessionId)

        this.tableContents = new TableContents(this.sessionId)
        this.showDatabases()

        //fix height of table-contents div
        let rpDims = document.getElementById('app-right-panel').getBoundingClientRect()
        let sbDims = document.getElementById('search-bar').getBoundingClientRect()
        Log(TAG, `rph: ${rpDims.height} sbh ${sbDims.height}`)
        let tc = document.getElementById('table-contents')
        tc.style.height = (rpDims.height - sbDims.height) + 'px'
    }

    async showDatabases() {
        let dbs = await DbUtils.fetchAll(this.sessionId, 'show databases')
        Utils.setOptions(this.$databases, dbs, '')
    }

    async showTables(db) {
        let tables = await DbUtils.fetchAll(this.sessionId, `show tables from \`${db}\``)
        this.$tables.replaceChildren()
        let $t = document.getElementById('table-template')
        let t = $t.innerHTML
        tables.forEach((tbl) => {
            Log(TAG, tbl)
            let h = Utils.generateNode(t, {table: tbl[1]})
            this.$tables.append(h)
        })
    }
}

new App()
