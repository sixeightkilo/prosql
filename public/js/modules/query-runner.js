import { Log } from './logger.js'
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
import { Hotkeys } from './hotkeys.js'

const TAG = "query-runner"

class QueryRunner {
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

        PubSub.subscribe(Constants.GRID_H_RESIZED, () => {
            this.editor.resize();
        });

        PubSub.subscribe(Constants.CELL_EDITED, async (data) => {
            this.tableUtils.undo();
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

    async init() {
        this.$root = document.getElementById('app-right-panel')
        this.$footer = document.getElementById('footer-right-panel')

        let $g1 = document.getElementById('query-container');
        let $e1 = document.getElementById('query-editor');
        let $e2 = document.getElementById('query-results');
        let $resizer = document.getElementById('query-container-resizer');
        new GridResizerV($g1, $e1, $resizer, $e2);

        this.$queryResults = document.getElementById('query-results')
        this.$table = this.$queryResults.querySelector('table')
        this.tableUtils = new TableUtils(this.$queryResults);

        //this.adjustView()

        Hotkeys.init();
        this.editor = new Ace('query-editor');
        await this.editor.init();

        this.editor.setValue("select * from `bills-1`");

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

        let s = new Date()

        q = q.trim();

        if (!/^select|show/i.test(q)) {
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

        if (res.status == "ok" && save) {
            PubSub.publish(Constants.QUERY_DISPATCHED, {
                query: q,
                tags: [Constants.USER]
            })
        }

        return res;
    }

    async runAll() {
        let json = await Utils.fetch('/split?' + new URLSearchParams({q: this.editor.getAll()}));
        Log(TAG, JSON.stringify(json));
        for (let i = 0; i < json.data.length; i++) {
            let q = json.data[i];
            this.cursorId = null;
            let res = await this.runQuery(q);

            if (res.status == "error") {
                Log(TAG, `runall breaking: ${res.msg}`);
                break;
            }

            Log(TAG, `${res['rows-affected']}`);
        }
    }

    async formatQuery() {
        let q = this.editor.getValue();
        Log(TAG, q);
        let json = await Utils.fetch('/prettify?' + new URLSearchParams({q: q}));
        this.editor.setValue(json.data);
        this.editor.clearSelection();
        this.editor.focus();
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

export { QueryRunner }
