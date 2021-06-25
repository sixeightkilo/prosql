import { defineCustomElements } from '/node_modules/@revolist/revogrid/dist/esm/loader.js'
import { columnTemplate } from './column-template.js'
import { cellTemplate } from './cell-template.js'
import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'
import { Constants } from './constants.js'
import { Stack } from './stack.js'
import { Stream } from './stream.js'
import { TableUtils } from './table-utils.js'

const OPERATORS = [
    ['operator', '='],
    ['operator', '<>'],
    ['operator', '>'],
    ['operator', '<'],
    ['operator', '>='],
    ['operator', '<='],
    ['operator', 'IN'],
    ['operator', 'LIKE'],
    ['operator', 'BETWEEN'],
    ['operator', 'IS NULL'],
    ['operator', 'IS NOT NULL'],
]

const TAG = "table-contents"
const USE_WS = true

class TableContents {
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

    async showFkRef(table, col, val) {
        this.table = table
        Log(TAG, `Displaying ${table}`)
        let columns = DbUtils.fetchAll(this.sessionId, `show columns from \`${this.table}\``)
        let contraints = DbUtils.fetch(this.sessionId, encodeURIComponent(`SELECT
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE
                TABLE_SCHEMA = '${this.db}\' and
                TABLE_NAME = '${this.table}\'`))

        let values = await Promise.all([columns, contraints])

        //update the column name selector
        Utils.setOptions(this.$columNames, values[0], '')

        let fkMap = this.createFKMap(values[1])
        Log(TAG, JSON.stringify(fkMap))

        //show BATCH_SIZE rows from table
        //this.showHeaders(this.extractColumns(values[0]))
        //let cols = this.extractColumns(values[0])
        //this.tableUtils.showHeaders(this.$table, cols)
        let query = `select * from \`${table}\` 
                         where \`${col}\` = '${val}'`

        let params = {
            'session-id': this.sessionId,
            query: query
        }

        let stream = new Stream(Constants.WS_URL + '/execute_ws?' + new URLSearchParams(params))
        this.tableUtils.showContents.apply(this, [stream, fkMap])
    }

    async search() {
        let query = `select * from \`${this.table}\` 
                         where \`${this.$columNames.value}\`
                         ${this.$operators.value}
                         '${this.$searchText.value}'`
        Log(TAG, query)
        let rows = await DbUtils.fetch(this.sessionId, encodeURIComponent(query))
        //todo: fk map must be created here as well
        TableContents.showResults(rows, {})
    }

    async enable() {
        Log(TAG, 'enable')

        if (this.isEnabled) {
            Log(TAG, 'skipping enable')
            return
        }

        this.$root.style.gridTemplateRows = "2em auto"
        this.$root.replaceChildren()
        let n = Utils.generateNode(this.$rootTemplate, {})
        this.$root.append(n)

        this.$columNames = document.getElementById('column-names')
        this.$operators = document.getElementById('operators')
        this.$searchText = document.getElementById('search-text')
        this.$search = document.getElementById('search')
        this.$tableContents = document.getElementById('table-contents')
        //this.$table = this.$tableContents.querySelector('table')
        this.contentWidth = this.$tableContents.getBoundingClientRect().width

        this.$search.addEventListener('click', async () => {
            this.search()
        })

        this.$searchText.addEventListener('keyup', async (e) => {
            if (e.key == "Enter") {
                this.search()
            }
        })

        this.$tableContents.addEventListener('click', async (e) => {
            let target = event.target;
            if (target.className != 'icon-new-tab') {
                return
            }

            let value = target.previousSibling.textContent

            Log(TAG, `${target.dataset.table}:${target.dataset.column}:${value}`)
            await this.showFkRef(target.dataset.table, target.dataset.column, value)
            this.stack.push(target.dataset.table, target.dataset.column, value)
        })

        //update operators
        Utils.setOptions(this.$operators, OPERATORS, '')

        if (this.table) {
            this.show(this.table)
        }

        this.adjustView()

        this.isEnabled = true
    }

    async disable() {
        Log(TAG, 'disable')
        this.isEnabled = false
    }

    async show(table) {
        if (!this.isEnabled) {
            //ignore if tables contents are not being displayed
            return
        }

        this.table = table
        Log(TAG, `Displaying ${table}`)

        this.stack.reset()
        this.stack.push(table)

        if (USE_WS) {
            return this.show_ws()
        }

        this.show_ajax(table)
    }

    async show_ws() {
        Log(TAG, "show_ws")

        let columns = DbUtils.fetchAll(this.sessionId, `show columns from \`${this.table}\``)
        let contraints = DbUtils.fetch(this.sessionId, `SELECT
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE
                TABLE_SCHEMA = '${this.db}\' and
                TABLE_NAME = '${this.table}\'`)

        let values = await Promise.all([columns, contraints])

        //update the column name selector
        Utils.setOptions(this.$columNames, values[0], '')

        let fkMap = this.createFKMap(values[1])
        let cols = this.extractColumns(values[0])

        //this.tableUtils.showHeaders(this.$table, cols)

        let params = {
            'session-id': this.sessionId,
            query: `select * from \`${this.table}\` limit ${Constants.BATCH_SIZE}`
        }

        let stream = new Stream(Constants.WS_URL + '/execute_ws?' + new URLSearchParams(params))
        //this.tableUtils.showContents_batch.apply(this, [stream, fkMap])
        this.tableUtils.showContents.apply(this, [stream, fkMap])
    }

    async show_ajax(table) {
        let s = new Date()

        let columns = DbUtils.fetchAll(this.sessionId, `show columns from \`${this.table}\``)
        let rows = DbUtils.fetch(this.sessionId, `select * from \`${this.table}\` limit ${Constants.BATCH_SIZE}`)
        let contraints = DbUtils.fetch(this.sessionId, `SELECT
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE
                TABLE_SCHEMA = '${this.db}\' and
                TABLE_NAME = '${this.table}\'`)

        let values = await Promise.all([columns, rows, contraints])

        //update the column name selector
        Utils.setOptions(this.$columNames, values[0], '')

        let fkMap = this.createFKMap(values[2])
        Log(TAG, JSON.stringify(fkMap))

        TableContents.showResults(values[1], fkMap)

        let e = new Date()
        this.$footer.innerHTML = e.getTime() - s.getTime() + ' ms'
    }

    extractColumns(arr) {
        let cols = []
        arr.forEach((e) => {
            cols.push(e[1])
        })

        return cols
    }

    createFKMap(constraints) {
        let fkMap = {}
        let colIndex, refTblIndex, refColIndex

        //first get indexes of columns of interest
        let i = 0
        constraints[0].forEach((c) => {
            switch (c) {
                case 'COLUMN_NAME':
                    colIndex = (i + 1)
                    break

                case 'REFERENCED_TABLE_NAME':
                    refTblIndex = (i + 1)
                    break;

                case 'REFERENCED_COLUMN_NAME':
                    refColIndex = (i + 1)
                    break;
            }
            i++
        })

        //Now get values of columns for each row
        constraints.forEach((row) => {
            if (row[refTblIndex] != "NULL") {
                fkMap[row[colIndex]] = {
                    'ref-table': row[refTblIndex],
                    'ref-column': row[refColIndex],
                }
            }
        })

        return fkMap
    }

    async init() {
        this.$root = document.getElementById('app-right-panel')
        this.$rootTemplate = document.getElementById('table-contents-template').innerHTML
        this.$footer = document.getElementById('footer-right-panel')
        this.tableUtils = new TableUtils()

        this.stack = new Stack(async (e) => {
            await this.navigate(e)
        })

        this.enable()
    }

    async navigate(e) {
        Log(TAG, JSON.stringify(e))
        switch (e.type) {
            case 'table':
                await this.show(e.table)
                break

            case 'fk-ref':
                await this.showFkRef(e.table, e.column, e.value)
                break
        }
        Log(TAG, "Done navigate")
    }

    static showResults(rows, fkMap) {
        const grid = document.querySelector('revo-grid');
        let columns = [];
        let items = [];

        for (let i = 0; i < rows.length; i++) {
            if (i == 0) {
                for (let j = 0; j < rows[i].length; j += 2) {
                    columns.push({
                        'prop': rows[i][j],
                        'name': rows[i][j],
                        cellTemplate: (createElement, props) => {
                            return cellTemplate(createElement, props, {});
                        },
                    });
                }
            }

            let item = {};
            for (let j = 0; j < rows[i].length; j += 2) {
                item[rows[i][j]] = rows[i][j + 1];
            }

            items.push(item);
        }

        Log(TAG, JSON.stringify(columns));
        Log(TAG, JSON.stringify(items));

        grid.resize = true;
        grid.columns = columns;
        grid.source = items;
    }

    async adjustView() {
        //fix height of table-contents div
        let rpDims = document.getElementById('app-right-panel').getBoundingClientRect()
        let sbDims = document.getElementById('search-bar').getBoundingClientRect()
        Log(TAG, `rph: ${rpDims.height} sbh ${sbDims.height}`)
        this.$tableContents.style.height = (rpDims.height - sbDims.height) + 'px'
    }
}

export { TableContents }
