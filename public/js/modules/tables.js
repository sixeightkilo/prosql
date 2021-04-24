import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'
import { Constants } from './constants.js'

const TAG = "tables"

class Tables {
    constructor(sessionId) {
        this.sessionId = sessionId
        this.$tables = document.getElementById('tables')
        this.$tableFilter = document.getElementById('table-filter')
        this.$tableFilter.addEventListener('keyup', () => {
            this.filter()
        })
        Log(TAG, `sessionId: ${sessionId}`)
    }

    setSessionId(sessionId) {
        this.sessionId = sessionId
        Log(TAG, `sessionId: ${sessionId}`)
    }

    filter() {
        let f = this.$tableFilter.value

        if (f == '') {
            this.render(this.tables)
            return
        }

        Log(TAG, `Filtering ${f}`)

        let regex = new RegExp(`${f}`)
        let tables = this.tables.filter(t => regex.test(t))
        this.render(tables)
    }

    async show(db) {
        let tables = await DbUtils.fetchAll(this.sessionId, `show tables from \`${db}\``)
        this.tables = []

        //save the table list in a more convinent form
        tables.forEach((t) => {
            this.tables.push(t[1])
        })
        this.render(this.tables)
    }

    render(tables) {
        this.$tables.replaceChildren()
        let $t = document.getElementById('table-template')
        let t = $t.innerHTML

        tables.forEach((tbl) => {
            let h = Utils.generateNode(t, {table: tbl})
            this.$tables.append(h)
        })
    }
}

export { Tables }
