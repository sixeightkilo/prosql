import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'
import { Constants } from './constants.js'
import { TableContents } from './table-contents.js'
import { CodeJar } from 'https://medv.io/codejar/codejar.js'

const TAG = "query-manager"
const USE_WS = true

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
        this.$footer = document.getElementById('footer-right-panel')
    }

    async enable() {
        if (this.isEnabled) {
            return
        }

        this.$root.style.gridTemplateRows = "2em 1fr 1fr"
        this.$root.replaceChildren()
        let n = Utils.generateNode(this.$rootTemplate, {})
        this.$root.append(n)

        let editor = document.querySelector('#query-editor')
		const highlight = (editor) => {
			const code = editor.textContent
			// Do something with code and set html.
			editor.innerHTML = code
		}

		this.jar = CodeJar(editor, highlight)
        //debug
		this.jar.updateCode("select * from `bills-1` limit 1000")

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

        if (USE_WS) {
            this.runQuery_ws()
            return
        }

        this.runQuery_ajax()
    }

    async runQuery_ajax() {
        let s = new Date()

        let q = this.jar.toString()
        let rows = await DbUtils.fetch(this.sessionId, encodeURIComponent(q))
        TableContents.showCols(this.extractCols(rows))
        TableContents.showResults(rows, {})

        let e = new Date()
        this.$footer.innerHTML = e.getTime() - s.getTime() + ' ms'
    }

    async runQuery_ws() {
        let s = new Date()

        let q = this.jar.toString()
        let params = {
            'session-id': this.sessionId,
            query: q,
            'req-id': Utils.uuid()
        }

        let ws = new WebSocket(Constants.WS_URL + '/execute_ws?' + new URLSearchParams(params))
        ws.onclose = (evt) => {
            Log(TAG, "CLOSE");
            ws = null;
        }

        let i = 0
        ws.onmessage = (evt) => {
            if (i == 0) {
                let e = new Date()
                this.$footer.innerHTML = e.getTime() - s.getTime() + ' ms'
                i++
            }
        }

        ws.onerror = (evt) => {
            Log(TAG, "ERROR: " + evt.data);
        }
    }

    extractCols(rows) {
        if (rows.length == 0) {
            return []
        }

        let cols = []
        for (let j = 0; j < rows[0].length; j += 2) {
            cols.push(rows[0][j])
        }
        return cols
    }

    async formatQuery() {
        let q = this.jar.toString()
        Log(TAG, q)
        let json = await Utils.fetch('/prettify?' + new URLSearchParams({q: q}))
        //this.$queryEditor.value = json.query;
        this.jar.updateCode(json.query)
    }

    async disable() {
        this.jar.destroy()
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
