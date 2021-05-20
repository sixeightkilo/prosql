import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'
import { Constants } from './constants.js'
import { TableContents } from './table-contents.js'

const TAG = "query-manager"

class QueryManager {
    constructor(sessionId) {
        this.sessionId = sessionId
        Log(TAG, `sessionId: ${sessionId}`)
        this.init()
    }

    setSessionInfo(sessionId, db) {
        this.sessionId = sessionId
        this.db = db
        Log(TAG, `sessionId: ${sessionId} db: ${db}`)
    }

    async init() {
        this.$root = document.getElementById('app-right-panel')
        this.$rootTemplate = document.getElementById('query-container-template').innerHTML
    }

    async enable() {
        if (this.isEnabled) {
            return
        }

        this.$root.style.gridTemplateRows = "2em 1fr 1fr"
        this.$root.replaceChildren()
        let n = Utils.generateNode(this.$rootTemplate, {})
        this.$root.append(n)

        this.$queryEditor = document.getElementById('query-editor')
        this.$formatQuery = document.getElementById('format-query')

        this.$formatQuery.addEventListener('click', async (e) => {
            this.formatQuery()
        })

        this.$runQuery = document.getElementById('run-query')
        this.$runQuery.addEventListener('click', async (e) => {
            this.runQuery()
        })

        this.isEnabled = true
    }

    async runQuery() {
        if (!this.db) {
            alert('No database selected')
            return
        }

        let q = this.$queryEditor.value
        let rows = await DbUtils.fetch(this.sessionId, encodeURIComponent(q))
        TableContents.showResults([rows[0]], {})
    }

    async formatQuery() {
        let q = this.$queryEditor.value
        Log(TAG, q)
        let json = await Utils.fetch('/prettify?' + new URLSearchParams({q: q}))
        this.$queryEditor.value = json.query;
    }

    async disable() {
        this.isEnabled = false
    }

    async adjustView() {
        //fix height of table-contents div
        let rpDims = document.getElementById('app-right-panel').getBoundingClientRect()
        let sbDims = document.getElementById('search-bar').getBoundingClientRect()
        Log(TAG, `rph: ${rpDims.height} sbh ${sbDims.height}`)
        this.$tableContents.style.height = (rpDims.height - sbDims.height) + 'px'
    }
}

export { QueryManager }
