import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'
import { Constants } from './constants.js'
import { Stack } from './stack.js'

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
        let query = `select * from \`${table}\` 
                         where \`${col}\` = '${val}'`
        let rows = DbUtils.fetch(this.sessionId, encodeURIComponent(query))
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

        let values = await Promise.all([columns, rows, contraints])

        //update the column name selector
        Utils.setOptions(this.$columNames, values[0], '')

        let fkMap = this.createFKMap(values[2])
        Log(TAG, JSON.stringify(fkMap))

        //show BATCH_SIZE rows from table
        this.showCols(values[0])
        this.showResults(values[1], fkMap)
    }

    async search() {
        let query = `select * from \`${this.table}\` 
                         where \`${this.$columNames.value}\`
                         ${this.$operators.value}
                         ${this.$searchText.value}`
        Log(TAG, query)
        let rows = await DbUtils.fetch(this.sessionId, encodeURIComponent(query))
        //todo: fk map must be created here as well
        this.showResults(rows, {})
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
            if (target.className != 'fk-ref icon-new-tab') {
                return
            }

            let value = target.parentElement.textContent

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
        this.table = table
        Log(TAG, `Displaying ${table}`)

        this.stack.reset()
        this.stack.push(table)

        let columns = DbUtils.fetchAll(this.sessionId, `show columns from \`${this.table}\``)
        let rows = DbUtils.fetch(this.sessionId, `select * from \`${this.table}\``)
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

        //show BATCH_SIZE rows from table
        this.showCols(values[0])
        this.showResults(values[1], fkMap)
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
        Log(TAG, this.$rootTemplate)

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

    showCols(cols) {
        let $h = document.getElementById('results-header-tr')
        $h.replaceChildren()

        let $ht = document.getElementById('results-header-col-template')
        let ht = $ht.innerHTML

        //create column headers
        for (let j = 0; j < cols.length; j++) {
            let h = Utils.generateNode(ht, {
                heading: cols[j][1] 
            })
            $h.appendChild(h)
        }
    }

    showResults(rows, fkMap) {
        let $b = document.getElementById('results-body')
        $b.replaceChildren()

        if (rows.length == 0) {
            return
        }

        let $bt = document.getElementById('results-body-col-template')
        let bt = $bt.innerHTML

        for (let i = 0; i < rows.length; i++) {
            //append a new row
            let $tr = Utils.generateNode('<tr></tr>', {})
            $b.appendChild($tr)

            let $row = $b.lastChild

            for (let j = 1; j < rows[i].length; j += 2) {
                let v = rows[i][j]
                let c = rows[i][j - 1] //this is column name
                let refTable = ''
                let refColumn = ''

                //get reftable and refColumn if any. Only for Non NULL values
                if (fkMap[c] && v != "NULL") {
                    refTable = fkMap[c]['ref-table']
                    refColumn = fkMap[c]['ref-column']
                }

                let h = Utils.generateNode(bt, {
                    value: v,
                    'ref-table': refTable,
                    'ref-column': refColumn
                })

                $row.appendChild(h)

                //show link if required
                if (refTable) {
                    let $col = $row.lastChild
                    let $link = $col.querySelector('i')
                    $link.style.display = 'inline'
                }
            }
        }
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
