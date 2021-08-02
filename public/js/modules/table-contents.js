import { defineCustomElements } from '/node_modules/@revolist/revogrid/dist/esm/loader.js'
import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'
import { Constants } from './constants.js'
import { Stack } from './stack.js'
import { Stream } from './stream.js'
import { TableUtils } from './table-utils.js'
import { PubSub } from './pubsub.js'

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

class TableContents {
    constructor(sessionId) {
        this.sessionId = sessionId
        Log(TAG, `sessionId: ${sessionId}`)
        this.init()

        PubSub.subscribe(Constants.STREAM_ERROR, (data) => {
            if (data.error == Err.ERR_NO_AGENT) {
                window.location = '/install';
                return;
            }
            Log(TAG, `${Constants.STREAM_ERROR}: ${JSON.stringify(data)}`);
            alert(data.error);
        });
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
        Utils.setOptions(this.$operators, OPERATORS, '')
        this.$searchText.value = '';

        let fkMap = this.createFKMap(values[1])
        Log(TAG, JSON.stringify(fkMap))

        let query = `select * from \`${table}\` 
                         where \`${col}\` = '${val}'`

        let params = {
            'session-id': this.sessionId,
            query: encodeURIComponent(query),
            'num-of-rows': Constants.BATCH_SIZE_WS,
        }

        let stream = new Stream(Constants.WS_URL + '/query_ws?' + new URLSearchParams(params))
        this.tableUtils.showContents(stream, fkMap)
    }

    async search() {
        let query = `select * from \`${this.table}\` 
                         where \`${this.$columNames.value}\`
                         ${this.$operators.value}
                         '${this.$searchText.value}'`
        Log(TAG, query)
        let params = {
            'session-id': this.sessionId,
            query: encodeURIComponent(query),
            'num-of-rows': Constants.BATCH_SIZE_WS,
        }

        let stream = new Stream(Constants.WS_URL + '/query_ws?' + new URLSearchParams(params))
        this.tableUtils.showContents(stream, this.fkMap)
    }

    async enable() {
        Log(TAG, 'enable')

        if (this.isEnabled) {
            Log(TAG, 'skipping enable')
            return
        }

        this.$columNames = document.getElementById('column-names')
        this.$operators = document.getElementById('operators')
        this.$searchText = document.getElementById('search-text')
        this.$search = document.getElementById('search')
        this.$tableContents = document.getElementById('table-contents')
        this.contentWidth = this.$tableContents.getBoundingClientRect().width

        this.$contents = document.getElementById('table-contents')
        this.tableUtils = new TableUtils(this.$contents)

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
            if (!target.classList.contains('fk-icon')) {
                return
            }

            let value = target.previousSibling.textContent

            Log(TAG, `${target.dataset.table}:${target.dataset.column}:${value}`)
            PubSub.publish(Constants.TABLE_CHANGED, {table: target.dataset.table});
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

        return this.show_ws()
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
        Utils.setOptions(this.$operators, OPERATORS, '')
        this.$searchText.value = '';

        this.fkMap = this.createFKMap(values[1])
        this.columns = this.extractColumns(values[0])

        let params = {
            'session-id': this.sessionId,
            query: encodeURIComponent(`select * from \`${this.table}\` limit ${Constants.BATCH_SIZE}`),
            'num-of-rows': Constants.BATCH_SIZE_WS,
        }

        let stream = new Stream(Constants.WS_URL + '/query_ws?' + new URLSearchParams(params))
        this.tableUtils.showContents(stream, this.fkMap)
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
        let colIndex, refTblIndex, refColIndex, constraintNameIndex

        //first get indexes of columns of interest
        let i = 0
        constraints[0].forEach((c) => {
            switch (c) {
                case 'CONSTRAINT_NAME':
                    constraintNameIndex = (i + 1)
                    break

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

            if (row[constraintNameIndex] == 'PRIMARY') {
                fkMap['primary-key'] = row[colIndex]
            }
        })

        return fkMap
    }

    async init() {
        this.$root = document.getElementById('app-right-panel')
        //this.$footer = document.getElementById('footer-right-panel')

        this.stack = new Stack(async (e) => {
            await this.navigate(e)
        })

        this.enable()

        PubSub.subscribe('cell-edited', async (data) => {
            Log(TAG, JSON.stringify(data));
            let res = await DbUtils.execute(this.sessionId, 
                    `update \`${this.table}\`
                    set \`${data.col.name}\` = '${data.col.value}' 
                    where \`${data.key.name}\` = '${data.key.value}'`);
        });
    }

    async navigate(e) {
        Log(TAG, JSON.stringify(e))
        PubSub.publish(Constants.TABLE_CHANGED, {table: e.table});

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

    async adjustView() {
        //fix height of table-contents div
        let rpDims = document.getElementById('app-right-panel').getBoundingClientRect()
        let sbDims = document.getElementById('search-bar').getBoundingClientRect()
        Log(TAG, `rph: ${rpDims.height} sbh ${sbDims.height}`)
        this.$tableContents.style.height = (rpDims.height - sbDims.height) + 'px'
    }
}

export { TableContents }
