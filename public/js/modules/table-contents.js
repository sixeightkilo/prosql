import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { Stream } from './stream.js'
import { DbUtils } from './dbutils.js'
import { Constants } from './constants.js'
import { Stack } from './stack.js'
import { TableUtils } from './table-utils.js'
import { PubSub } from './pubsub.js'
import { Hotkeys } from './hotkeys.js'
import RowAdder from './row-adder.js'

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
        Log(TAG, `sessionId: ${sessionId}`)

        this.sessionId = sessionId
        this.init()
    }

    //public method
    setSessionInfo(sessionId, db) {
        this.sessionId = sessionId
        this.db = db
        Log(TAG, `sessionId: ${sessionId} db: ${db}`)
    }

    async init() {
        Hotkeys.init();

        this.initDom();

        this.stack = new Stack(async (e) => {
            await this.navigate(e)
        })

        this.tableUtils = new TableUtils(this.$contents)

        this.initSubscribers();
        this.initHandlers()
        this.initPager();
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
    }

    initSubscribers() {
        PubSub.subscribe(Constants.STREAM_ERROR, (err) => {
            Log(TAG, `${Constants.STREAM_ERROR}: ${JSON.stringify(err)}`);
            Err.handle(err);
        });

        PubSub.subscribe(Constants.QUERY_CANCELLED, () => {
            DbUtils.cancel(this.sessionId, this.cursorId);
        });

        PubSub.subscribe(Constants.SORT_REQUESTED, (data) => {
            this.handleSort(data);
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

        PubSub.subscribe(Constants.CELL_EDITED, async (data) => {
            await this.handleCellEdit(data);
        });
    }

    async initHandlers() {
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
        Log(TAG, JSON.stringify(data));
        this.sortColumn = data.column;
        this.sortOrder = data.order;
        let query = this.query + 
            ` ${DbUtils.getOrder(this.sortColumn, this.sortOrder)} limit ${DbUtils.getLimit(this.page, 0)}`;
        this.cursorId = null;
        this.updateContents(query);
    }

    async handleCellEdit(data) {
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
    }

    async showFkRef(table, col, val) {
        this.table = table

        await this.initTable(this.table);

        let query = `select * from \`${table}\` 
                         where \`${col}\` = '${val}'`

        this.cursorId = null;
        let res = await this.showContents(query, this.fkMap);

        if (res.status == "ok") {
            PubSub.publish(Constants.QUERY_DISPATCHED, {
                query: query,
                tags: [Constants.USER]
            })

            RowAdder.init(this.table, this.columns);
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

        let query = `${this.query} limit ${DbUtils.getLimit(this.page, 0)}`;
        Log(TAG, this.query);
        this.stack.push(this.table, this.$columNames.value, this.$operators.value, this.$searchText.value)

        this.cursorId = null;
        let res = await this.showContents(query, this.fkMap);

        if (res.status == "ok") {
            PubSub.publish(Constants.QUERY_DISPATCHED, {
                query: this.query,
                tags: [Constants.USER]
            })
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
        this.stack.push(this.table)

        await this.initTable(this.table);

        //the base query currently in operation
        this.query = `select * from \`${this.table}\``;
        //query qualified as required
        let query = `${this.query} limit ${DbUtils.getLimit(this.page, 0)}`;

        this.cursorId = null;
        this.showContents(query, this.fkMap)

        RowAdder.init(this.table, this.columns);
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

    async handleNextRows() {
        if (!this.table) {
            return;
        }

        if (this.inFlight) {
            return;
        }

        this.inFlight = true;

        let query = `${this.query} ${DbUtils.getOrder(this.sortColumn, this.sortOrder)} limit ${DbUtils.getLimit(this.page, 1)}`;
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

        let query = `${this.query} ${DbUtils.getOrder(this.sortColumn, this.sortOrder)} limit ${DbUtils.getLimit(this.page, -1)}`;
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
                await this.initTable(this.table);

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
