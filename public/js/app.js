import { Err } from './modules/error.js'
import { Utils } from './modules/utils.js'
import { DbUtils } from './modules/dbutils.js'
import { Constants } from './modules/constants.js'
import { TableContents } from './modules/table-contents.js'

class App {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.init()
            this.$databases.addEventListener('change', async () => {
                this.showTables(this.$databases.value)
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
        this.tableContents = new TableContents()

        this.sessionId = Utils.getFromSession(Constants.SESSION_ID)
        console.log(this.sessionId)

        this.showDatabases()

        //fix height of table-contents div
        let rpDims = document.getElementById('app-right-panel').getBoundingClientRect()
        let sbDims = document.getElementById('search-bar').getBoundingClientRect()
        //let rp = rightPanel.getBoundingClientRect()
        //let rp = rightPanel.getBoundingClientRect()
        console.log(`rph: ${rpDims.height} sbh ${sbDims.height}`)
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
            console.log(tbl)
            let h = Utils.generateNode(t, {table: tbl[1]})
            this.$tables.append(h)
        })
    }
}

new App()
