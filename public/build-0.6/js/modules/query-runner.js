import { Logger } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'
import { Constants } from './constants.js'
import { TableUtils } from './table-utils.js'
import { Stream } from './stream.js'
import { GridResizerV } from './grid-resizer-v.js'
import { PubSub } from './pubsub.js'
import { FileDownloader } from './file-downloader.js'
import { Ace } from './ace.js'

const TAG = "query-runner"
const QUERY_RUNNER_QUERY = "query-runner-query";
const QUERY_RUNNER_GRID_V_DIMENTIONS = "query-runner-grid-v-dimensions"

class QueryRunner {
    constructor(sessionId) {

        this.sessionId = sessionId
        Logger.Log(TAG, `sessionId: ${sessionId}`)
        this.init()

        PubSub.subscribe(Constants.STREAM_ERROR, (err) => {
            Logger.Log(TAG, `${Constants.STREAM_ERROR}: ${JSON.stringify(err)}`);
            Err.handle(err);
        });

        PubSub.subscribe(Constants.QUERY_CANCELLED, () => {
            DbUtils.cancel(this.sessionId, this.cursorId);
        });

        PubSub.subscribe(Constants.GRID_H_RESIZED, () => {
            this.editor.resize();
        });

        PubSub.subscribe(Constants.GRID_V_RESIZED, (data) => {
            this.editor.resize();
            Utils.saveToSession(QUERY_RUNNER_GRID_V_DIMENTIONS, JSON.stringify(data));
        });

        PubSub.subscribe(Constants.CELL_EDITED, async (data) => {
            this.tableUtils.undo();
        });

        PubSub.subscribe(Constants.EDITOR_TEXT_CHANGED, async (data) => {
            if (data.text.trim() == '') {
                Utils.removeFromSession(QUERY_RUNNER_QUERY);
                return;
            }

            Utils.saveToSession(QUERY_RUNNER_QUERY, data.text);
        });

        //handle all keyboard shortcuts
        [
            Constants.CMD_RUN_QUERY,
            Constants.CMD_RUN_ALL,
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
        Logger.Log(TAG, `sessionId: ${sessionId} db: ${db}`)
    }

    async init() {
        this.$root = document.getElementById('app-right-panel')
        this.$footer = document.getElementById('footer-right-panel')
        this.$timeTaken = document.getElementById('time-taken')
        this.$rowsAffected = document.getElementById('rows-affected')

        this.editor = new Ace('query-editor');
        await this.editor.init();

        let $g1 = document.getElementById('query-container');
        let $e1 = document.getElementById('query-editor');
        let $e2 = document.getElementById('query-results');
        let $resizer = document.getElementById('query-container-resizer');
        let grid = new GridResizerV($g1, $e1, $resizer, $e2);
        let dims = Utils.getFromSession(QUERY_RUNNER_GRID_V_DIMENTIONS);
        if (dims != null) {
            grid.set(JSON.parse(dims));
            this.editor.resize();
        }

        this.$queryResults = document.getElementById('query-results')
        this.$table = this.$queryResults.querySelector('table')
        this.tableUtils = new TableUtils(this.$queryResults);


        this.$formatQuery = document.getElementById('format-query')

        this.$formatQuery.addEventListener('click', async (e) => {
            this.handleCmd(Constants.CMD_FORMAT_QUERY);
        })

        this.$runQuery = document.getElementById('run-query')
        this.$runQuery.addEventListener('click', async (e) => {
            this.handleCmd(Constants.CMD_RUN_QUERY);
        })

        this.$runAll = document.getElementById('run-all')
        this.$runAll.addEventListener('click', async (e) => {
            this.handleCmd(Constants.CMD_RUN_ALL);
        })

        this.$exportResults = document.getElementById('export-results')
        this.$exportResults.addEventListener('click', async (e) => {
            this.handleCmd(Constants.CMD_EXPORT);
        })

        this.$next = document.getElementById('next')
        this.$next.addEventListener('click', async (e) => {
            this.handleCmd(Constants.CMD_NEXT_ROWS);
        })

        this.restoreState();
    }

    restoreState() {
        let v = Utils.getFromSession(QUERY_RUNNER_QUERY);
        if (v != null) {
            this.editor.setValue(v);
        }
    }

    async handleCmd(cmd) {
        let q;
        switch (cmd) {
        case Constants.CMD_RUN_QUERY:
            this.cursorId = null;
            q = this.editor.getValue();
            this.runQuery(q);
            break;

        case Constants.CMD_RUN_ALL:
            this.runAll();
            break;

        case Constants.CMD_NEXT_ROWS:
            q = this.editor.getValue();
            this.runQuery(q, false);
            break;

        case Constants.CMD_EXPORT:
            this.handleExport();
            break;

        case Constants.CMD_FORMAT_QUERY:
            this.formatQuery();
            break;
        }
    }

    async handleExport() {
        let q = this.editor.getValue()
        let dbUtils = new DbUtils();
        let err = await dbUtils.exportResults.apply(this, [q])

        if (err == Err.ERR_NONE) {
            PubSub.publish(Constants.QUERY_DISPATCHED, {
                query: q,
                tags: [Constants.USER]
            })
        }
    }

    async runQuery(q, save = true) {
        if (!this.db) {
            alert('No database selected')
            return {
                'status': 'error',
                'msg': 'No database selected'
            }
        }

        this.tableUtils.clearInfo.apply(this);

        q = q.trim();

        if (!/^select|show|explain|with/i.test(q)) {
            let s = Date.now();

            this.tableUtils.showLoader();
            let dbUtils = new DbUtils();
            let res = await dbUtils.execute.apply(this, [q]);
            if (res.status == "error") {
                this.tableUtils.hideLoader();
                return res;
            }

            if (save) {
                PubSub.publish(Constants.QUERY_DISPATCHED, {
                    query: q,
                    tags: [Constants.USER]
                })
            }

            let e = Date.now();
            this.tableUtils.showInfo.apply(this, [(e - s), res.data[0][1]]);
            this.tableUtils.hideLoader();
            return {
                'status': 'ok',
                'rows-affected': res.data[0][1]
            }
        }

        if (!this.cursorId) {
            this.cursorId = await DbUtils.fetchCursorId(this.sessionId, q);
        }

        let params = {
            'session-id': this.sessionId,
            'cursor-id': this.cursorId,
            'req-id': Utils.uuid(),
            'num-of-rows': Constants.BATCH_SIZE_WS
        }

        let stream = new Stream(Constants.WS_URL + '/fetch_ws?' + new URLSearchParams(params))

        let res = await this.tableUtils.showContents(stream, {}, {}, true);

        //if (res.status == "ok" && save) {
        if (res.status == "ok") {
            this.tableUtils.showInfo.apply(this, [res['time-taken'], res['rows-affected']]);

            if (save) {
                PubSub.publish(Constants.QUERY_DISPATCHED, {
                    query: q,
                    tags: [Constants.USER]
                })
            }
        }

        return res;
    }

    async runAll() {
        let queries = this.split(this.editor.getAll());
        for (let i = 0; i < queries.length; i++) {
            let q = queries[i];
            Logger.Log(TAG, `running: ${q}`);
            this.cursorId = null;
            let res = await this.runQuery(q);

            if (res.status == "error") {
                Logger.Log(TAG, `runall breaking: ${res.msg}`);
                break;
            }

            Logger.Log(TAG, `${res['rows-affected']}`);
        }
    }

    split(str) {
        let queries = [];
        let tokens = sqlFormatter.format(str, {
            language: 'mysql'
        }).tokens;

        let q = '';
        tokens.forEach((t) => {
            if (t.type == 'operator' && t.value == ';') {
                queries.push(q);
                q = '';
                return;
            }

            q += t.whitespaceBefore + t.value;
        });

        q.trim();
        if (q != '') {
            queries.push(q);
        }
        return queries;
    }

    async formatQuery() {
        let q = this.editor.getValue();
        q = sqlFormatter.format(q, {
            language: 'mysql'
        });

        Logger.Log(TAG, JSON.stringify(q.tokens));

        this.editor.setValue(q.query);
        this.editor.clearSelection();
        this.editor.focus();
    }
}

export { QueryRunner }
