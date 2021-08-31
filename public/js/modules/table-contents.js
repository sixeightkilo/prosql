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
import { Hotkeys } from './hotkeys.js'

const OPERATORS = [
    '=',
    '<>',
    '>',
    '<',
    '>=',
    '<=',
    //'IN',
    'LIKE',
    //'BETWEEN',
    'IS NULL',
    'IS NOT NULL',
]

const TAG = "table-contents"

class TableContents {
    constructor(sessionId) {
        this.sessionId = sessionId
        Log(TAG, `sessionId: ${sessionId}`)
        this.init()

        PubSub.subscribe(Constants.STREAM_ERROR, (err) => {
            Log(TAG, `${Constants.STREAM_ERROR}: ${JSON.stringify(err)}`);
            Err.handle(err);
        });

        PubSub.subscribe(Constants.QUERY_CANCELLED, () => {
            DbUtils.cancel(this.sessionId, this.cursorId);
        });

        PubSub.subscribe(Constants.SORT_REQUESTED, (data) => {
            Log(TAG, JSON.stringify(data));
            this.sortColumn = data.column;
            this.sortOrder = data.order;
            let query = this.query + ` ${this.getOrder(this.sortColumn, this.sortOrder)} limit ${this.getLimit(0)}`;
            this.cursorId = null;
            //this.showContents(query, this.fkMap);
            this.updateContents(query);
        });

        //handle all keyboard shortcuts
        [
            Constants.CMD_RUN_QUERY,
            Constants.CMD_NEXT_ROWS,
            Constants.CMD_PREV_ROWS,
            Constants.CMD_EXPORT,
            Constants.CMD_FORMAT_QUERY,
        ].forEach((c) => {
            ((c) => {
                PubSub.subscribe(c, () => {
                    this.handleCmd(c);
                });
            })(c)
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
        let contraints = DbUtils.fetchAll(this.sessionId, `SELECT
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
        columns = Utils.extractColumns(values[0])

        //update the column name selector
        Utils.setOptions(this.$columNames, columns, '')
        Utils.setOptions(this.$operators, OPERATORS, '')
        this.$searchText.value = '';

        let fkMap = this.createFKMap(values[1])
        Log(TAG, JSON.stringify(fkMap))

        let query = `select * from \`${table}\` 
                         where \`${col}\` = '${val}'`
        this.cursorId = null;
        let err = await this.showContents(query, fkMap);

        if (err == Err.ERR_NONE) {
            PubSub.publish(Constants.QUERY_DISPATCHED, {
                query: query,
                tags: [Constants.USER]
            })
        }
    }

    async search() {
        //disable input field for is null and is not null
        if (this.$operators.value == "IS NULL" || this.$operators.value == "IS NOT NULL") {
            this.query = `select * from \`${this.table}\` 
                             where \`${this.$columNames.value}\`
                             ${this.$operators.value}`;
        } else {
            this.query = `select * from \`${this.table}\` 
                             where \`${this.$columNames.value}\`
                             ${this.$operators.value}
                             '${this.$searchText.value}'`;
        }
        let query = `${this.query} limit ${this.getLimit(0)}`;
        Log(TAG, this.query);
        this.cursorId = null;
        this.stack.push(this.table, this.$columNames.value, this.$operators.value, this.$searchText.value)
        let res = await this.showContents(query, this.fkMap);

        if (res.status == "ok") {
            PubSub.publish(Constants.QUERY_DISPATCHED, {
                query: this.query,
                tags: [Constants.USER]
            })
        }
    }

    async enable() {
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
            if (this.$searchText.value) {
                this.$clearFilter.style.display = 'block';
            } else {
                this.$clearFilter.style.display = 'none';
            }

            if (e.key == "Enter") {
                this.search()
            }
        })

        this.$tableContents.addEventListener('click', async (e) => {
            Log(TAG, "clicked");
            let target = event.target;
            if (!target.classList.contains('fk-icon')) {
                return
            }

            let value = target.dataset.value;

            Log(TAG, `${target.dataset.table}:${target.dataset.column}:${value}`)
            PubSub.publish(Constants.TABLE_CHANGED, {table: target.dataset.table});
            await this.showFkRef(target.dataset.table, target.dataset.column, value)
            this.stack.push(target.dataset.table, target.dataset.column, value)
        })

        //update operators
        Utils.setOptions(this.$operators, OPERATORS, '')

        this.$operators.addEventListener('change', () => {
            if (this.$operators.value == "IS NULL" || this.$operators.value == "IS NOT NULL") {
                this.$searchText.disabled = true;
                return;
            }
            this.$searchText.disabled = false;
        });

        if (this.table) {
            this.show(this.table)
        }
    }

    resetPager() {
        this.page = 0;
        this.$prev.classList.add('pager-disable');
    }

    async show(table) {
        this.table = table
        this.resetPager();

        Log(TAG, `Displaying ${table}`)

        this.stack.reset()
        this.stack.push(table)

        let columns = DbUtils.fetchAll(this.sessionId, `show columns from \`${this.table}\``)
        let contraints = DbUtils.fetchAll(this.sessionId, `SELECT
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
        this.fkMap = this.createFKMap(values[1])
        this.columns = Utils.extractColumns(values[0])

        //update the column name selector
        Utils.setOptions(this.$columNames, this.columns, '')
        Utils.setOptions(this.$operators, OPERATORS, '')
        this.$searchText.value = '';

        this.query = `select * from \`${this.table}\``;
        let query = `${this.query} limit ${this.getLimit(0)}`;
        this.cursorId = null;
        this.showContents(query, this.fkMap)
    }

    getLimit(delta) {
        return `${(this.page + delta) * Constants.BATCH_SIZE_WS}, ${Constants.BATCH_SIZE_WS}`;
    }

    getOrder(col, order) {
        if (!order) {
            return '';
        }
        return ` order by \`${col}\` ${order}`;
    }

    async showContents(query, fkMap) {
        if (!this.cursorId) {
            this.cursorId = await DbUtils.fetchCursorId(this.sessionId, query);
        }

        let params = {
            'session-id': this.sessionId,
            'cursor-id': this.cursorId,
            'req-id': Utils.uuid(),
            'num-of-rows': Constants.BATCH_SIZE_WS
        }

        let stream = new Stream(Constants.WS_URL + '/fetch_ws?' + new URLSearchParams(params))
        return this.tableUtils.showContents(stream, fkMap, true, true)
    }

    async updateContents(query) {
        if (!this.cursorId) {
            this.cursorId = await DbUtils.fetchCursorId(this.sessionId, query);
        }

        let params = {
            'session-id': this.sessionId,
            'cursor-id': this.cursorId,
            'req-id': Utils.uuid(),
            'num-of-rows': Constants.BATCH_SIZE_WS
        }

        let stream = new Stream(Constants.WS_URL + '/fetch_ws?' + new URLSearchParams(params))
        return this.tableUtils.update(stream);
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
        Hotkeys.init();

        this.$root = document.getElementById('app-right-panel')
        //this.$footer = document.getElementById('footer-right-panel')

        this.stack = new Stack(async (e) => {
            await this.navigate(e)
        })

        this.enable()

        PubSub.subscribe(Constants.CELL_EDITED, async (data) => {
            Log(TAG, JSON.stringify(data));
            let query = `update \`${this.table}\`
                    set \`${data.col.name}\` = '${data.col.value}' 
                    where \`${data.key.name}\` = '${data.key.value}'`;
            let dbUtils = new DbUtils();
            let res = await dbUtils.execute.apply(this, [query]);

            if (res.status == "ok") {
                PubSub.publish(Constants.QUERY_DISPATCHED, {
                    query: query,
                    tags: [Constants.USER]
                });

                let rows = res.data[0][1];
                Utils.showAlert(`Updated ${rows} ${rows == "1" ? "row" : "rows"}`, 2000);
                return;
            }

            this.tableUtils.undo();
            alert(res.msg);
        });

        this.initPager();
        
        this.$exportFiltered = document.getElementById('export-filtered-results')
        this.$exportFiltered.addEventListener('click', async (e) => {
            this.handleCmd(Constants.CMD_EXPORT);
        })

        this.$clearFilter = document.getElementById('clear-filter')
        this.$clearFilter.addEventListener('click', async (e) => {
            this.handleCmd(Constants.CMD_CLEAR_FILTER);
        })
    }

    async handleCmd(cmd) {
        switch (cmd) {
        case Constants.CMD_EXPORT:
            this.handleExport();
            break;

        case Constants.CMD_NEXT_ROWS:
            this.handleNextRows();
            break;

        case Constants.CMD_PREV_ROWS:
            this.handlePrevNows();
            break;

        case Constants.CMD_CLEAR_FILTER:
            this.handleClearFilter();
            break;
        }
    }

    handleClearFilter() {
        Utils.setOptions(this.$columNames, this.columns, '')
        Utils.setOptions(this.$operators, OPERATORS, '')

        this.$searchText.value = '';
        this.$searchText.focus();

        this.$clearFilter.style.display = 'none';

        if (this.table) {
            this.show(this.table)
        }
    }

    async handleExport() {
        let dbUtils = new DbUtils();
        let res = await dbUtils.exportResults.apply(this, [this.query])

        if (res.status == "ok") {
            PubSub.publish(Constants.QUERY_DISPATCHED, {
                query: this.query,
                tags: [Constants.USER]
            });
        }
    }

    async handleNextRows() {
        if (!this.table) {
            return;
        }

        if (this.inFlight) {
            return;
        }

        this.inFlight = true;

        let query = `${this.query} ${this.getOrder(this.sortColumn, this.sortOrder)} limit ${this.getLimit(1)}`;
        this.cursorId = null;
        let res = await this.updateContents(query);
        if (res.status == "ok") {
            this.$prev.classList.remove('pager-disable');
            this.page++;
        }

        this.inFlight = false;
    }

    async handlePrevNows() {
        if (this.inFlight) {
            return;
        }

        this.inFlight = true;

        if (this.page == 0) {
            this.inFlight = false;
            return;
        }

        let query = `${this.query} ${this.getOrder(this.sortColumn, this.sortOrder)} limit ${this.getLimit(-1)}`;
        this.cursorId = null;

        let res = await this.updateContents(query);
        if (res.status == "ok") {
            this.page--;
            if (this.page == 0) {
                this.$prev.classList.add('pager-disable');
            }
        }

        this.inFlight = false;
    }

    initPager() {
        this.$next = document.getElementById('next')
        this.$prev = document.getElementById('prev')

        this.$next.addEventListener('click', async (e) => {
            this.handleCmd(Constants.CMD_NEXT_ROWS);
        })

        this.$prev.addEventListener('click', async (e) => {
            this.handleCmd(Constants.CMD_PREV_ROWS);
        })
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

            case 'search':
                this.table = e.table;
                this.$columNames.value = e.column;
                this.$operators.value = e.operator;
                this.$searchText.value = e.value;
                await this.search()
                break
        }
        Log(TAG, "Done navigate")
    }
}

export { TableContents }
