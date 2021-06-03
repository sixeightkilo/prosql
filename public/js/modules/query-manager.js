import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'
import { Constants } from './constants.js'
import { TableContents } from './table-contents.js'
import { CodeJar } from 'https://medv.io/codejar/codejar.js'
import { TableUtils } from './table-utils.js'
import { Stream } from './stream.js'

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
        this.tableUtils = new TableUtils()
    }

    async enable() {
        if (this.isEnabled) {
            return
        }

        this.$root.style.gridTemplateRows = "2em 1fr 1fr"
        this.$root.replaceChildren()
        let n = Utils.generateNode(this.$rootTemplate, {})
        this.$root.append(n)

		this.$queryResults = document.getElementById('query-results')
		this.$table = this.$queryResults.querySelector('table')

        this.adjustView()

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

        let stream = new Stream(Constants.WS_URL + '/execute_ws?' + new URLSearchParams(params))

        //extract headers from the first row
        let row = await stream.get()
        let cols = this.extractCols(row)
        this.tableUtils.showHeaders(this.$table, cols)

        //append first row manually
        let $b = document.getElementById('results-body')
        $b.replaceChildren()

        let $bt = document.getElementById('results-body-col-template')
        let bt = $bt.innerHTML
        TableUtils.appendRow($b, bt, row, {})

        //append rest of rows
        this.tableUtils.showContents.apply(this, [stream, {}, false])
    }

    extractCols(row) {
        let cols = []
        for (let j = 0; j < row.length; j += 2) {
            cols.push(row[j])
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
        //fix height of query editor and results div
        let rpDims = document.getElementById('app-right-panel').getBoundingClientRect()
        let sbDims = document.getElementById('query-sub-menu').getBoundingClientRect()
        let footerDims = document.getElementById('footer').getBoundingClientRect()
        let editor = document.getElementById('query-editor')
        let results = document.getElementById('query-results')

        let h = (rpDims.height - sbDims.height - footerDims.height) / 2

        editor.style.height = h + 'px'
        results.style.height = h + 'px'
    }
}

export { QueryManager }
