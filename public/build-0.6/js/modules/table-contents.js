import { Logger } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { Stream } from './stream.js'
import { DbUtils } from './dbutils.js'
import { Constants } from './constants.js'
import { Stack } from './stack.js'
import { TableUtils } from './table-utils.js'
import { PubSub } from './pubsub.js'
import { Hotkeys } from './hotkeys.js'
import { RowAdder } from './row-adder.js'
import { RowDeleter } from './row-deleter.js'
import { ColumnSelector } from './column-selector.js'
import { TableInfo } from './table-info.js'
import Pager from './pager.js'

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
        Logger.Log(TAG, `sessionId: ${sessionId}`)

        this.sessionId = sessionId
        this.init()
    }

    //public method
    setSessionInfo(sessionId, db) {
        this.sessionId = sessionId
        this.db = db
        this.rowAdder.setSessionId(this.sessionId);
        this.rowDeleter.setSessionId(this.sessionId);
        this.tableInfo.setSessionId(this.sessionId);

        Logger.Log(TAG, `sessionId: ${sessionId} db: ${db}`)
    }

    async init() {
        Hotkeys.init();
        this.rowAdder = new RowAdder(this.sessionId);
        this.rowDeleter = new RowDeleter(this.sessionId);
        this.tableInfo = new TableInfo(this.sessionId);
        this.colSelector = new ColumnSelector();

        this.initDom();

        this.stack = new Stack(async (e) => {
            await this.navigate(e)
        })

        this.tableUtils = new TableUtils(this.$contents)

        this.initSubscribers();
        this.initHandlers()
    }

    initDom() {
        this.$columNames = document.getElementById('column-names')
        this.$operators = document.getElementById('operators')
        this.$searchText = document.getElementById('search-text')
        this.$search = document.getElementById('search')
        this.$tableContents = document.getElementById('table-contents')
        this.$contents = document.getElementById('table-contents')
        this.$exportFiltered = document.getElementById('export-filtered-results')
        this.$clearFilter = document.getElementById('clear-filter')
        this.$clearFilter = document.getElementById('clear-filter')
        this.$timeTaken = document.getElementById('time-taken')
        this.$rowsAffected = document.getElementById('rows-affected')
    }

    initSubscribers() {
        PubSub.subscribe(Constants.STREAM_ERROR, (err) => {
            Logger.Log(TAG, `${Constants.STREAM_ERROR}: ${JSON.stringify(err)}`);
            Err.handle(err);
        });

        PubSub.subscribe(Constants.QUERY_CANCELLED, () => {
            DbUtils.cancel(this.sessionId, this.cursorId);
        });

        PubSub.subscribe(Constants.SORT_REQUESTED, (data) => {
            this.handleSort(data);
        });

        PubSub.subscribe(Constants.COLUMNS_SELECTED, (data) => {
            this.handleSelectColumns(data);
        });

        [
            Constants.ROW_DELETED, 
            Constants.TABLE_TRUNCATED, 
        ].forEach((c) => {
            ((c) => {
                PubSub.subscribe(c, () => {
                    this.refresh();
                });
            })(c)
        });

        //handle all keyboard shortcuts
        [
            Constants.CMD_RUN_QUERY,
            Constants.CMD_EXPORT,
            Constants.CMD_FORMAT_QUERY,
        ].forEach((c) => {
            ((c) => {
                PubSub.subscribe(c, () => {
                    this.handleCmd(c);
                });
            })(c)
        });

        PubSub.subscribe(Constants.CELL_EDITED, async (data) => {
            Logger.Log(TAG, Constants.CELL_EDITED);
            await this.handleCellEdit(data);
        });
    }

    refresh() {
        const f = async (query) => {
            return await this.updateContents(query);
        }

        Pager.init(this.query, f, this.sortColumn, this.sortOrder);
    }

    async initHandlers() {
        this.$search.addEventListener('click', async () => {
            this.search()
            this.stack.push(this.table, this.$columNames.value, this.$operators.value, this.$searchText.value)
        })

        this.$searchText.addEventListener('keyup', async (e) => {
            if (this.$searchText.value) {
                this.$clearFilter.style.display = 'block';
            } else {
                this.$clearFilter.style.display = 'none';
            }

            if (e.key == "Enter") {
                this.search()
                this.stack.push(this.table, this.$columNames.value, this.$operators.value, this.$searchText.value)
            }
        })

        this.$tableContents.addEventListener('click', async (e) => {
            Logger.Log(TAG, "clicked");
            let target = event.target;
            if (!target.classList.contains('fk-icon')) {
                return
            }

            let value = target.dataset.value;

            Logger.Log(TAG, `${target.dataset.table}:${target.dataset.column}:${value}`)
            PubSub.publish(Constants.TABLE_CHANGED, {table: target.dataset.table});
            await this.showFkRef(target.dataset.table, target.dataset.column, value)
            this.stack.push(target.dataset.table, target.dataset.column, value)
        })

        this.$operators.addEventListener('change', () => {
            if (this.$operators.value == "IS NULL" || this.$operators.value == "IS NOT NULL") {
                this.$searchText.disabled = true;
                return;
            }
            this.$searchText.disabled = false;
        });

        this.$exportFiltered.addEventListener('click', async (e) => {
            this.handleCmd(Constants.CMD_EXPORT);
        })

        this.$clearFilter.addEventListener('click', async (e) => {
            this.handleCmd(Constants.CMD_CLEAR_FILTER);
        })
    }

    async handleSort(data) {
        Logger.Log(TAG, JSON.stringify(data));
        this.sortColumn = data.column;
        this.sortOrder = data.order;

        const f = async (query) => {
            return await this.updateContents(query);
        }

        Pager.init(this.query, f, this.sortColumn, this.sortOrder);
    }

    async handleCellEdit(data) {
        Logger.Log(TAG, JSON.stringify(data));
        let query = `update \`${this.table}\`
                    set \`${data.col.name}\` = '${data.col.value}' 
                    where \`${data.key.name}\` = '${data.key.value}'`;
        let dbUtils = new DbUtils();
        let res = await dbUtils.execute.apply(this, [query]);
        this.tableUtils.showLoader();

        if (res.status == "ok") {
            PubSub.publish(Constants.QUERY_DISPATCHED, {
                query: query,
                tags: [Constants.USER]
            });

            let rows = res.data[0][1];
            Utils.showAlert(`Updated ${rows} ${rows == "1" ? "row" : "rows"}`, 2000);

            if (rows == 0) {
                this.tableUtils.undo();
            }
            this.tableUtils.hideLoader();
            return;
        }

        this.tableUtils.hideLoader();
        this.tableUtils.undo();
    }

    async showFkRef(table, col, val) {
        this.table = table

        await this.initTable(this.table);
        this.rowAdder.init(this.table, this.columns);
        this.colSelector.init(this.table, this.columns);

        let query = `select * from \`${table}\` 
                         where \`${col}\` = '${val}'`

        const f = async (query) => {
            let res = await this.showContents(query, this.fkMap);

            if (res.status == "ok") {
                PubSub.publish(Constants.QUERY_DISPATCHED, {
                    query: query,
                    tags: [Constants.USER]
                })

            }
            return res
        }

        Pager.init(query, f);
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

        Logger.Log(TAG, this.query);

        const f = async (query) => {
            let res = await this.showContents(query, this.fkMap);

            if (res.status == "ok") {
                PubSub.publish(Constants.QUERY_DISPATCHED, {
                    query: this.query,
                    tags: [Constants.USER]
                })
            }

            return res;
        }

        Pager.init(this.query, f);
    }

    reset() {
        this.sortColumn = null;
        this.sortOrder = null;
    }

    async show(table) {
        this.table = table

        Logger.Log(TAG, `Displaying ${table}`)

        this.stack.reset()
        this.stack.push(this.table)

        await this.initTable(this.table);
        this.rowAdder.init(this.table, this.columns);
        this.rowDeleter.init(this.table);
        this.colSelector.init(this.table, this.columns);

        //the base query currently in operation
        this.query = `select * from \`${this.table}\``;

        const f = async (query) => {
            let res = this.showContents(query, this.fkMap);
            return res;
        }

        Logger.Log(TAG, `${this.sortColumn}:${this.sortOrder}`);
        Pager.init(this.query, f, this.sortColumn, this.sortOrder);
    }

    async initTable(table) {
        let columns = DbUtils.fetchAll(this.sessionId, `show columns from \`${table}\``)
        let contraints = DbUtils.fetchAll(this.sessionId, `SELECT
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE
                TABLE_SCHEMA = '${this.db}\' and
                TABLE_NAME = '${table}\'`)

        let values = await Promise.all([columns, contraints])
        this.fkMap = DbUtils.createFKMap(values[1])
        this.columns = Utils.extractColumns(values[0])

        //update the column name selector
        Utils.setOptions(this.$columNames, this.columns, '')
        Utils.setOptions(this.$operators, OPERATORS, '')
        this.$searchText.value = '';
    }

    async showContents(query, fkMap, sel = true) {
        this.tableUtils.clearInfo.apply(this);
        this.cursorId = await DbUtils.fetchCursorId(this.sessionId, query);

        let params = {
            'session-id': this.sessionId,
            'cursor-id': this.cursorId,
            'req-id': Utils.uuid(),
            'num-of-rows': Constants.BATCH_SIZE_WS
        }

        let stream = new Stream(Constants.WS_URL + '/fetch_ws?' + new URLSearchParams(params))
        let selection = this.colSelector.getSelection(this.table);
        let res =  await this.tableUtils.showContents(stream, fkMap, selection, true, true)

        Logger.Log(TAG, JSON.stringify(res));
        if (res.status == "ok") {
            this.tableUtils.showInfo.apply(this, [res['time-taken'], res['rows-affected']]);
        }

        return res;
    }

    async updateContents(query) {
        this.tableUtils.clearInfo.apply(this);
        this.cursorId = await DbUtils.fetchCursorId(this.sessionId, query);
        let params = {
            'session-id': this.sessionId,
            'cursor-id': this.cursorId,
            'req-id': Utils.uuid(),
            'num-of-rows': Constants.BATCH_SIZE_WS
        }

        let stream = new Stream(Constants.WS_URL + '/fetch_ws?' + new URLSearchParams(params))
        let res = await this.tableUtils.update(stream);

        if (res.status == "ok") {
            this.tableUtils.showInfo.apply(this, [res['time-taken'], res['rows-affected']]);
        }

        return res;
    }

    async handleCmd(cmd) {
        switch (cmd) {
        case Constants.CMD_EXPORT:
            this.handleExport();
            break;

        case Constants.CMD_CLEAR_FILTER:
            this.handleClearFilter();
            break;
        }
    }

    handleSelectColumns(data) {
        this.tableUtils.selectColumns(data.cols);
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
        if (!this.query) {
            return;
        }

        let dbUtils = new DbUtils();
        let res = await dbUtils.exportResults.apply(this, [this.query])

        if (res.status == "ok") {
            PubSub.publish(Constants.QUERY_DISPATCHED, {
                query: this.query,
                tags: [Constants.USER]
            });
        }
    }

    async navigate(e) {
        Logger.Log(TAG, JSON.stringify(e))
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
                await this.initTable(this.table);

                this.$columNames.value = e.column;
                this.$operators.value = e.operator;
                this.$searchText.value = e.value;

                await this.search()
                break
        }
        Logger.Log(TAG, "Done navigate")
    }
}

export { TableContents }
