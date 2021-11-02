(function () {
    'use strict';

    const DISABLED = [
        'grid-resizer',
        'query-db',
        //'query-finder',
    ];

    function Log(tag, str, port = null) {
        //if (!ENABLED.has(tag)) {
            //return
        //}
        //
        if (DISABLED.includes(tag)) {
            return;
        }

        if (tag == "worker") {
            port.postMessage(`${tag}: ${str}`);
            return
        }

        let [month, date, year]    = new Date().toLocaleDateString("en-US").split("/");
        let [hour, minute, second] = new Date().toLocaleTimeString("en-US").split(/:| /);

        let o = `${date}-${month}-${year} ${hour}:${minute}:${second}:::${tag}: ${str}`;
        console.log(o);
    }

    class Err {
        static get ERR_NONE () {
            return 'none'
        }

        static get ERR_NO_AGENT () {
            return 'no-agent'
        }

        static get ERR_INVALID_USER_INPUT() {
            return 'invalid-user-input'
        }

        static get ERR_INVALID_SESSION_ID() {
            return 'invalid-session-id'
        }

        static get ERR_INVALID_CURSOR_ID() {
            return 'invalid-cursor-id'
        }

        static get ERR_DB_ERROR() {
            return 'db-error'
        }

        static get ERR_UNRECOVERABLE() {
            return 'unrecoverable-error'
        }

        static handle(err) {
            if (err.error == Err.ERR_NO_AGENT) {
                window.location = '/install';
                return;
            }

            if (err.error == Err.ERR_INVALID_SESSION_ID) {
                window.location = '/login';
                return;
            }

            alert(err.error);
        }
    }

    const TAG$j = "utils";
    class Utils {
        static saveToSession(key, val) {
            window.sessionStorage.setItem(key, val);
        }

        static getFromSession(key) {
            return window.sessionStorage.getItem(key)
        }


        static saveToLocalStorage(key, value) {
            window.localStorage.setItem(key, value);
        }

        static getFromLocalStorage(key) {
            return window.localStorage.getItem(key) ?? null;
        }

    	static processTemplate(templ, data) {
    		var re = new RegExp(/{(.*?)}/g);
    		templ = templ.replace(re, function(match, p1) {
    			if (data[p1] || data[p1] == 0 || data[p1] == '') {
    				return data[p1];
    			} else {
    				return match;
    			}
    		});
    		return templ;
    	}

    	//https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
    	static generateNode(templ, data) {
            templ = Utils.processTemplate(templ, data);	
            let template = document.createElement('template');
            template.innerHTML = templ.trim();
            return template.content
        }

        static async fetch(url, handleError = true) {
            try {
                let response = await fetch(url, {
                    headers: {
                        'X-Request-ID': Utils.uuid()
                    }
                });

                Log(TAG$j, response);

                let json = await response.json();

                if (json.status == 'error') {
                    throw json
                }

                return json
            } catch (e) {
                Log(TAG$j, e);
                let res = {
                    'status' : 'error',
                    'data': null,
                };

                if (e instanceof TypeError) {
                    if (!handleError) {
                        res.msg = Err.ERR_NO_AGENT;
                        return res;
                    }
                    //user must install agent
                    window.location = '/install';
                    return;
                }

                res.msg = e.msg;
                if (res.msg == Err.ERR_INVALID_SESSION_ID) {
                    //user must login
                    window.location = '/login';
                    return;
                }

                //let client handle this
                if (!handleError) {
                    return res
                }

                if (res.msg == Err.ERR_INVALID_CURSOR_ID) {
                    //let caller handle this too
                    return res
                }

                //common error handling
                if (res.msg) {
                    //normal error. Display to user
                    alert(res.msg);
                    return res
                }
            }
        }

        static async setOptions($ctx, values, def) {
            $ctx.replaceChildren();

            let $ot = document.getElementById('option-template');
            let ot = $ot.innerHTML;

            values.forEach((v) => {
                let h = Utils.generateNode(ot, {value: v});
                $ctx.append(h);
            });

            $ctx.value = def;
        }

        static showAlert(msg, t) {
            let $alrt = document.getElementById('alert');
            let $msg = $alrt.querySelector('.msg');
            $msg.innerHTML = msg;
            $alrt.style.display = 'block';

            let bodyDims = document.querySelector('body').getBoundingClientRect();
            $alrt.style.left = (bodyDims.width / 2) + 'px';

            setTimeout(() => {
                $alrt.style.display = 'none';
            }, t);
        }

        static showNoData() {
            Log(TAG$j, "No data");
        }

        //https://gist.github.com/gordonbrander/2230317
        static uuid() {
            // Math.random should be unique because of its seeding algorithm.
            // Convert it to base 36 (numbers + letters), and grab the first 9 characters
            // after the decimal.
            return '_' + Math.random().toString(36).substr(2, 9);
        };

        static getOffset(el) {
            const rect = el.getBoundingClientRect();
            return {
                left: rect.left + window.scrollX,
                top: rect.top + window.scrollY,
                width: rect.width,
                height: rect.height,
            };
        }

       static extractColumns(arr) {
            let cols = [];
            arr.forEach((e) => {
                cols.push(e[1]);
            });

            return cols
        }

        static truncate(s, max) {
    		if (s.length > max) {
    			return s.substring(0, max) + '...';
    		}
    		return s;
    	}
    }

    class Constants {
        //hotkeys
        static get SHIFT_A() {
            return 'Alt+Shift+A'
        }

        static get SHIFT_R() {
            return 'Alt+Shift+R'
        }

        static get SHIFT_T() {
            return 'Alt+Shift+T'
        }

        static get SHIFT_O() {
            return 'Alt+Shift+O'
        }

        static get SHIFT_E() {
            return 'Alt+Shift+E'
        }

        static get SHIFT_N() {
            return 'Alt+Shift+N'
        }

        static get SHIFT_P() {
            return 'Alt+Shift+P'
        }

        static get SHIFT_L() {
            return 'Alt+Shift+L'
        }

        static get SHIFT_S() {
            return 'Alt+Shift+S'
        }

        static get SHIFT_BACK() {
            return 'Alt+Shift+,'
        }

        //commands triggered by user
        static get CMD_RUN_QUERY() {
            return 'cmd.run-query'
        }

        static get CMD_RUN_ALL() {
            return 'cmd.run-all'
        }

        static get CMD_FORMAT_QUERY() {
            return 'cmd.format-query'
        }

        static get CMD_EXPORT() {
            return 'cmd.export'
        }

        static get CMD_CLEAR_FILTER() {
            return 'cmd.clear-filter'
        }

        static get CMD_NEXT_ROWS() {
            return 'cmd.next-rows'
        }

        static get CMD_PREV_ROWS() {
            return 'cmd.prev-rows'
        }

        static get CMD_FORMAT_QUERY() {
            return 'cmd.format-query'
        }

        static get CMD_EXPORT_TABLE() {
            return 'cmd.export-table'
        }

        static get CMD_SEARCH_TABLES() {
            return 'cmd.search-tables'
        }


        static get CMD_BACK() {
            return 'cmd.back'
        }

        //events
        static get COLUMNS_SELECTED() {
            return 'cmd.columns-selected'
        }

        static get STREAM_ERROR() {
            return 'stream.stream-error'
        }

        static get SORT_REQUESTED() {
            return "table-utils.sort-requested"
        }

        static get QUERY_CANCELLED() {
            return 'table-utils.query-cancelled'
        }

        static get TABLE_SELECTED() {
            return 'tables.table-selected'
        }

        static get CELL_EDITED() {
            return 'tables.cell-edited'
        }

        static get TABLE_CHANGED() {
            return 'table-contents.table-changed'
        }

        static get DB_CHANGED() {
            return 'appbar.db-changed'
        }

        static get GRID_H_RESIZED() {
            return "gridh.resized"
        }

        static get QUERY_DISPATCHED() {
            return 'query-dispatched'
        }

        static get FILE_UPLOADED() {
            return 'file-uploaded'
        }

        static get QUERY_SAVED() {
            return 'query-saved'
        }

        static get SESSION_ID() {
            return 'session-id'
        }

        static get URL() {
            return 'http://localhost:23890'
        }

        static get WS_URL() {
            return 'ws://localhost:23890'
        }

        static get DB_NAME() {
            return 'prosql'
        }

        static get DB_VERSION() {
            return 1
        }

        static get CONNECTIONS() {
            return 'connections'
        }

        static get COLUMN_SELECTIONS() {
            return 'column-selections'
        }

        static get BATCH_SIZE() {
            return 1000
        }

        static get BATCH_SIZE_WS() {
            return 1000
        }

        static get CREDS() {
            return 'creds'
        }

        static get SYSTEM() {
            return 'system'
        }

        static get USER() {
            return 'user'
        }

        static get QUERY_DB_VERSION() {
            return 2
        }

        static get INIT_PROGRESS() {
            return "init-progress"
        }

        static get START_PROGRESS() {
            return "start-progress"
        }

        static get STOP_PROGRESS() {
            return "stop-progress"
        }

        static get UPDATE_PROGRESS() {
            return "update-progress"
        }

    }

    const TAG$i = "stream";

    class Stream {
        constructor(url) {
            this.promises = [];
            this.registered = false;

            this.ws = new WebSocket(url);

            this.ws.onerror = (evt) => {
                Log(TAG$i, "onerror:" + evt);
                this.rej(Err.ERR_NO_AGENT);
            };

            this.ws.onclose = (evt) => {
                Log(TAG$i, "onclose");
                this.ws = null;
            };
        }

        get() {
            return new Promise((res, rej) => {
                if (!this.registered) {
                    this.ws.onmessage = (evt) => {
                        let res = this.promises.shift();
                        let json = JSON.parse(evt.data);
                        if (json.status == "error") {
                            this.rej(json.msg);
                            return;
                        }
                        res(json['k']);
                    };
                    this.registered = true;
                }

                this.promises.push(res);
                this.rej = rej;
            })
        }
    }

    let subscribers = {};

    class PubSub {
        static subscribe(evt, cb) {
            if (!subscribers[evt]) {
                subscribers[evt] = new Set();
            }
            subscribers[evt].add(cb);
        }

        static publish(evt, data) {
            let list = subscribers[evt];
            if (!list) {
                return;
            }
            for (let s of list) {
                s(data);
            }
        }
    }

    class ProgressBar {
        constructor(options = {}) {
    		document.addEventListener("DOMContentLoaded", () => {
    			this.progressBar = document.getElementById('progress-bar-no-buttons');
    			this.message = this.progressBar.querySelector('.message');
    			this.time = this.progressBar.querySelector('.time');
    			this.hasButtons = false;
    		});

            PubSub.subscribe(Constants.INIT_PROGRESS, (data) => {
                this.time.innerHTML = '';
                this.message.innerHTML = '';
                this.elapsed = 0;

                if (this.hasButtons) {
                    this.title.innerHTML = data.title;
                }

                this.message.innerHTML = data.message;

                this.timer = setInterval(() => {
                    this.elapsed++;
                    this.time.innerHTML = this.elapsed + ' s';
                }, 1000);

                this.progressBar.classList.add('is-active');
            });

            PubSub.subscribe(Constants.START_PROGRESS, (data) => {
                this.time.innerHTML = '';
                this.message.innerHTML = '';
                this.elapsed = 0;

                if (this.hasButtons) {
                    this.title.innerHTML = data.title;
                }
            });

            PubSub.subscribe(Constants.STOP_PROGRESS, () => {
                clearInterval(this.timer);

                //if we have buttons, wait till user clicks ok
                if (this.ok) {
                    this.ok.disabled = false;
                    this.cancel.disabled = true;
                    return
                }

                //otherwise close ourselves immediately
                this.progressBar.classList.remove('is-active');
            });

            PubSub.subscribe(Constants.UPDATE_PROGRESS, (data) => {
                this.message.innerHTML = data.message;
            });
        }

        setOptions(options) {
            if (options.buttons) {
                this.progressBar = document.getElementById('progress-bar-with-buttons');
                this.title = this.progressBar.querySelector('.modal-card-title');
                this.ok = this.progressBar.querySelector('.ok');
                this.cancel = this.progressBar.querySelector('.cancel');
                this.cancelFunc = options.cancel;

                this.ok.disabled = true;
                this.cancel.disabled = false;

                this.ok.addEventListener('click', () => {
                    this.progressBar.classList.remove('is-active');
                });

                this.cancel.addEventListener('click', () => {
                    this.cancelFunc();
                    this.progressBar.classList.remove('is-active');
                });

                this.hasButtons = true;

            } else {
                this.ok = null;
                this.cancel = null;
                this.cancelFunc = null;
                this.progressBar = document.getElementById('progress-bar-no-buttons');
                this.hasButtons = false;
            }

            this.message = this.progressBar.querySelector('.message');
            this.time = this.progressBar.querySelector('.time');
        }
    }

    let progressBar = new ProgressBar();

    const TAG$h = "dbutils";
    class DbUtils {

        //todo: use WS in fetchall and get rid of fetch route from agent
        static async fetchAll(sessionId, query) {
            let params = {
                'session-id': sessionId,
                query: query
            };

            let json = await Utils.fetch(Constants.URL + '/query?' + new URLSearchParams(params));
            if (json.status == 'error') {
                Log(TAG$h, JSON.stringify(json));
                return []
            }

            let cursorId = json.data['cursor-id'];

            params = {
                'session-id': sessionId,
                'cursor-id': cursorId,
                'num-of-rows': Constants.BATCH_SIZE
            };

            let eof = false;
            let rows = [];

            do {
                json = await Utils.fetch(Constants.URL + '/fetch?' + new URLSearchParams(params));
                if (json.status == "error") {
                    Log(TAG$h, JSON.stringify(json));
                    return []
                }

                Log(TAG$h, JSON.stringify(json));
                if (!json.data) {
                    //if batch size == num of rows in query result, then we might get json.data = null
                    //but we should still return results fetched till this point
                    return rows
                }
                rows = rows.concat(json.data);
                eof = json.eof;
            } while (!eof)

            return rows
        }

        static async login(creds) {
            let json = await Utils.fetch(Constants.URL + '/login?' + new URLSearchParams(creds));
            if (json.status == 'error') {
                Log(TAG$h, JSON.stringify(json));
                return ""
            }

            return json.data['session-id']
        }

        async execute(query) {
            this.cursorId = await DbUtils.fetchCursorId(this.sessionId, query, true);

            let params = {
                'session-id': this.sessionId,
                'cursor-id': this.cursorId,
                'num-of-rows': -1,//not used
            };

            return await Utils.fetch(Constants.URL + '/fetch?' + new URLSearchParams(params));
        }

        static async cancel(sessionId, cursorId) {
            let params = {
                'session-id': sessionId,
                'cursor-id': cursorId,
            };

            await Utils.fetch(Constants.URL + '/cancel?' + new URLSearchParams(params));
        }

        static async fetchCursorId(sessionId, query, execute = false) {
            let q = encodeURIComponent(query);
            let params = {
                'session-id': sessionId,
                query: q
            };

            if (execute) {
                let json = await Utils.fetch(Constants.URL + '/execute?' + new URLSearchParams(params));
                return json.data['cursor-id']
            }

            let json = await Utils.fetch(Constants.URL + '/query?' + new URLSearchParams(params));
            return json.data['cursor-id']
        }

        async exportResults(q) {
            let cursorId = await DbUtils.fetchCursorId(this.sessionId, q);
            Log(TAG$h, `cursorId: ${cursorId}`);
            let params = {
                'session-id': this.sessionId,
                'cursor-id': cursorId,
                'req-id': Utils.uuid(),
                'num-of-rows': -1,
                'export': true
            };

            let stream = new Stream(Constants.WS_URL + '/fetch_ws?' + new URLSearchParams(params));

            progressBar.setOptions({
                buttons: true,
                cancel: () => {
                    DbUtils.cancel(this.sessionId, cursorId);
                    Log(TAG$h, `Cancelled ${cursorId}`);
                }
            });

            PubSub.publish(Constants.INIT_PROGRESS, {
                title: `Running query`,
                message: `Please wait`
            });
            let fileName = '';
            let n = 0;
            let err = Err.ERR_NONE;

            while (true) {
                let row;
                try {
                    row = await stream.get();
                } catch (e) {
                    PubSub.publish(Constants.STREAM_ERROR, {
                        'error': e
                    });
                    err = e;
                    break;
                }

                if (row.length == 1 && row[0] == "eos") {
                    break;
                }

                if (row[0] == "header") {
                    fileName = row[2];

                    PubSub.publish(Constants.START_PROGRESS, {
                        title: `Exporting to ${fileName}`
                    });

                    //If we are here query was OK, save to DB
                    PubSub.publish(Constants.QUERY_DISPATCHED, {
                        query: q,
                        tags: [Constants.USER]
                    });
                    continue;
                }

                if (row[0] == "current-row") {
                    n += row[1];

                    PubSub.publish(Constants.UPDATE_PROGRESS, {
                        message: `Processed ${row[1]} rows`
                    });
                }
            }

            if (n > 0) {
                PubSub.publish(Constants.UPDATE_PROGRESS, {
                    message: `Export complete`
                });
            } else {
                PubSub.publish(Constants.START_PROGRESS, {
                    title: `No data`
                });

                PubSub.publish(Constants.UPDATE_PROGRESS, {
                    message: `Processed 0 rows`
                });
            }

            PubSub.publish(Constants.STOP_PROGRESS, {});

            if (err == Err.ERR_NONE) {
                return {
                    'status': "ok",
                    'rows-affected': n
                }
            }

            return {
                'status': "error",
                'msg': err
            }
        }

        static createFKMap(constraints) {
            let fkMap = {};
            let colIndex, refTblIndex, refColIndex, constraintNameIndex;

            //first get indexes of columns of interest
            let i = 0;
            constraints[0].forEach((c) => {
                switch (c) {
                    case 'CONSTRAINT_NAME':
                        constraintNameIndex = (i + 1);
                        break

                    case 'COLUMN_NAME':
                        colIndex = (i + 1);
                        break

                    case 'REFERENCED_TABLE_NAME':
                        refTblIndex = (i + 1);
                        break;

                    case 'REFERENCED_COLUMN_NAME':
                        refColIndex = (i + 1);
                        break;
                }
                i++;
            });

            //Now get values of columns for each row
            constraints.forEach((row) => {
                if (row[refTblIndex] != "NULL") {
                    fkMap[row[colIndex]] = {
                        'ref-table': row[refTblIndex],
                        'ref-column': row[refColIndex],
                    };
                }

                if (row[constraintNameIndex] == 'PRIMARY') {
                    fkMap['primary-key'] = row[colIndex];
                }
            });

            return fkMap
        }

        static getLimit(page, delta) {
            return `${(page + delta) * Constants.BATCH_SIZE_WS}, ${Constants.BATCH_SIZE_WS}`;
        }

        static getOrder(col, order) {
            if (!order) {
                return '';
            }
            return ` order by \`${col}\` ${order}`;
        }
    }

    const TAG$g = "stack";

    class Stack {
        constructor(cb) {
            this.cb = cb;
            this.stack = [];
            this.curr = 0;

            this.$back = document.getElementById('back');
            this.$back.addEventListener('click', async () => {
                this.handleCmd(Constants.CMD_BACK);
            });

            [
                Constants.CMD_BACK,
            ].forEach((c) => {
                ((c) => {
                    PubSub.subscribe(c, () => {
                        this.handleCmd(c);
                    });
                })(c);
            });
        }

        async handleBack() {
            Log(TAG$g, `${this.stack.length}: ${this.curr}`);

            if (this.stack.length == 0) {
                return
            }

            if (this.curr == 0) {
                return
            }

            this.curr--;
            this.stack.pop();
            await this.cb(this.stack[this.curr]);
            Log(TAG$g, "Done back");
            if (this.curr == 0) {
                this.$back.classList.add('stack-disable');
            }
        }

        async handleCmd(cmd) {
            switch (cmd) {
                case Constants.CMD_BACK:
                    this.handleBack();
                    break;
            }
        }

        reset() {
            this.stack = [];
            this.curr = 0;
            this.$back.classList.add('stack-disable');
        }

        push(...args) {
            Log(TAG$g, JSON.stringify(args));
            if (args.length == 1) {
                this.stack.push({
                    'type': 'table',
                    'table': args[0]
                });
                Log(TAG$g, "table:" + JSON.stringify(this.stack));
                return
            }

            if (args.length == 3) {
                this.stack.push({
                    'type': 'fk-ref',
                    'table': args[0],
                    'column': args[1],
                    'value': args[2]
                });

                this.curr++;
                this.$back.classList.remove('stack-disable');
                Log(TAG$g, "fk-ref:" + JSON.stringify(this.stack));

                return
            }

            if (args.length == 4) {
                this.stack.push({
                    'type': 'search',
                    'table': args[0],
                    'column': args[1],
                    'operator': args[2],
                    'value': args[3]
                });

                this.curr++;
                this.$back.classList.remove('stack-disable');
                Log(TAG$g, "search:" + JSON.stringify(this.stack));

                return
            }
        }
    }

    class AgGrid {
        static init() {
            return new Promise((resolve, reject) => {
                let script = document.createElement('script');
                script.src = 'https://unpkg.com/ag-grid-community/dist/ag-grid-community.min.noStyle.js';
                document.head.appendChild(script);

    			let link = document.createElement("link");
    			link.href = "https://unpkg.com/ag-grid-community/dist/styles/ag-grid.css";
    			link.type = "text/css";
    			link.rel = "stylesheet";
    			document.getElementsByTagName("head")[0].appendChild(link);

    			link = document.createElement("link");
    			link.href = "https://unpkg.com/ag-grid-community/dist/styles/ag-theme-alpine.css";
    			link.type = "text/css";
    			link.rel = "stylesheet";
    			document.getElementsByTagName("head")[0].appendChild(link);

    			script.onload = () => {
    				resolve(agGrid.Grid);
    			};
    		});
    	}
    }

    const TAG$f = 'cell-renderer';

    class CellRenderer {
    	constructor(fkMap) {
            this.fkMap = fkMap;
            this.fkCellTemplate = document.getElementById('fk-cell-template').innerHTML;
            this.cellTemplate = document.getElementById('cell-template').innerHTML;
        }

        render(params) {
            Log(TAG$f, `${params.colDef.field}`);
            let id = params.colDef.colId;
            let c = params.colDef.field;
            let v = params.data[`${c}-${id}`];

            let refTable = '';
            let refColumn = '';

            if (this.fkMap[c] && v != "NULL") {
                refTable = this.fkMap[c]['ref-table'];
                refColumn = this.fkMap[c]['ref-column'];
            }

            let cls = (v == "NULL") ? "null" : "";

            if (refTable) {
                return Utils.generateNode(this.fkCellTemplate, {
                    'value': v,
                    'table': refTable,
                    'column': refColumn,
                });
            }

            return Utils.generateNode(this.cellTemplate, {
                'value': v,
                'cls': cls
            })
        }
    }

    class CellHeader {
        init(params) {
            this.params = params;
            //todo: Using generateNode causes lot of error in console
            this.$header = document.createElement('div');
            this.$header.innerHTML = `
           <div class="customHeaderLabel">${this.params.displayName}</div>
           <div class="customSortDownLabel inactive">
               <i class="fa fa-long-arrow-alt-down"></i>
           </div>
           <div class="customSortUpLabel inactive">
               <i class="fa fa-long-arrow-alt-up"></i>
           </div>
           <div class="customSortRemoveLabel inactive">
               <i class="fa fa-times"></i>
           </div>
       `;

            this.$sortDown = this.$header.querySelector(".customSortDownLabel");
            this.$sortUp = this.$header.querySelector(".customSortUpLabel");
            this.$sortRemove = this.$header.querySelector(".customSortRemoveLabel");

            if (this.params.enableSorting) {
                this.onSortAscRequestedListener = this.onSortRequested.bind(this, 'asc');
                this.$sortDown.addEventListener('click', this.onSortAscRequestedListener);
                this.onSortDescRequestedListener = this.onSortRequested.bind(this, 'desc');
                this.$sortUp.addEventListener('click', this.onSortDescRequestedListener);
                this.onRemoveSortListener = this.onSortRequested.bind(this, '');
                this.$sortRemove.addEventListener('click', this.onRemoveSortListener);

                this.onSortChangedListener = this.onSortChanged.bind(this);
                this.params.column.addEventListener('sortChanged', this.onSortChangedListener);
                this.onSortChanged();
            } else {
                this.$header.removeChild(this.$sortDown);
                this.$header.removeChild(this.$sortUp);
                this.$header.removeChild(this.$sortRemove);
            }
        }

        onSortChanged(order) {
            const deactivate = toDeactivateItems => {
                toDeactivateItems.forEach(toDeactivate => {
                    toDeactivate.className = toDeactivate.className.split(' ')[0];
                });
            };

            const activate = toActivate => {
                toActivate.className = toActivate.className + " sort-active";
            };

            if (order == 'asc') {
                deactivate([this.$sortUp, this.$sortRemove]);
                activate(this.$sortDown);
            } else if (order == 'desc') {
                deactivate([this.$sortDown, this.$sortRemove]);
                activate(this.$sortUp);
            } else {
                deactivate([this.$sortUp, this.$sortDown]);
                activate(this.$sortRemove);
            }
        }

        getGui() {
            return this.$header;
        }

        onSortRequested(order, event) {
            PubSub.publish(Constants.SORT_REQUESTED, {
                column: this.params.column.colDef.field,
                order: order
            });

            //this.params.setSort(order, event.shiftKey);
            this.onSortChanged(order);
        }

        destroy() {
            this.$sortDown.removeEventListener('click', this.onSortRequestedListener);
            this.$sortUp.removeEventListener('click', this.onSortRequestedListener);
            this.$sortRemove.removeEventListener('click', this.onSortRequestedListener);
            this.params.column.removeEventListener('sortChanged', this.onSortChangedListener);
        } 
    }

    const TAG$e = 'cell-editor';

    class CellEditor {
       init(params) {
            let id = params.colDef.colId;
            let c = params.colDef.field;
            this.value = params.data[`${c}-${id}`];

           this.input = document.createElement('input');
           this.input.classList.add('input');
           this.input.id = 'input';
           this.input.value = this.value;

           this.input.addEventListener('input', (event) => {
               this.value = event.target.value;
               Log(TAG$e, "listener:" + this.value);
           });
       }

       /* Component Editor Lifecycle methods */
       // gets called once when grid ready to insert the element
       getGui() {
           return this.input;
       }

       // the final value to send to the grid, on completion of editing
       getValue() {
           // this simple editor doubles any value entered into the input
           Log(TAG$e, "getvalue:" + this.value);
           return this.input.value;
       }

       // Gets called once before editing starts, to give editor a chance to
       // cancel the editing before it even starts.
       isCancelBeforeStart() {
           return false;
       }

       // Gets called once when editing is finished (eg if Enter is pressed).
       // If you return true, then the result of the edit will be ignored.
       isCancelAfterEnd() {
           // our editor will reject any value greater than 1000
           return false;
       }

       // after this component has been created and inserted into the grid
       afterGuiAttached() {
           this.input.focus();
       }
    }

    const TAG$d = "table-utils";

    class TableUtils {
        constructor($root) {
            this.$root = $root;
            this.$loaderTemplate = document.getElementById('table-loader-template').innerHTML;
            this.init();

            document.addEventListener('click', (e) => {
                let p = e.target.parentElement;
                if (p.id != 'cancel-query') {
                    return;
                }

                Log(TAG$d, "Cancel clicked");
                PubSub.publish(Constants.QUERY_CANCELLED, {});
            });
        }

        async init() {
    		await AgGrid.init();
        }

        async showContents(stream, fkMap, selection = {}, editable = false, sortable = false) {
            this.fkMap = fkMap;
            let grid = this.$root.querySelector('#grid');
            //clear existing grid if any
            if (grid != null) {
                grid.remove();
            }

            let n = Utils.generateNode('<div id="grid" class="ag-theme-alpine"></div>', {});
            this.$root.append(n);
            grid = this.$root.querySelector('#grid');

            this.showLoader();

            let i = 0;
            let cellRenderer = new CellRenderer(fkMap);
            let err = Err.ERR_NONE;

            while (true) {
                let row;
                try {
                    row = await stream.get();
                } catch (e) {
                    PubSub.publish(Constants.STREAM_ERROR, {
                        'error': e
                    });
                    err = e;
                    break;
                }

                if (row.length == 1 && row[0] == "eos") {
                    break;
                }

                if (i == 0) {
                    let cols = [];
                    //using colId makes it possible to display multiple columns with 
                    //same name
                    let k = 0;
                    for (let j = 0; j < row.length; j += 2) {

                        let show = selection[k] ?? true;
                        if (row[j] == fkMap['primary-key']) {
                            fkMap['primary-key-id'] = k;
                        }
                        cols.push({
                            field: row[j],
                            colId: k++,
                            hide: !show,
                            resizable: true,
                            editable: editable,
                            sortable: true,
                            onCellValueChanged: (params) => {
                                this.handleCellValueChanged(fkMap, params);
                            },
                            cellRenderer: (params) => {
                                return cellRenderer.render(params)
                            },
                            cellEditor: CellEditor,
                            valueGetter: params => {
                                Log(TAG$d, "valueGetter");
                                let id = params.colDef.colId;
                                let c = params.colDef.field;
                                return params.data[`${c}-${id}`];
                            },
                            valueSetter: params => {
                                Log(TAG$d, "valueSetter");
                                let id = params.colDef.colId;
                                let c = params.colDef.field;
                                params.data[`${c}-${id}`] = params.newValue;
                                return true;
                            }
                        });
                    }

    				let gridOptions = {
    					columnDefs: cols,
    					undoRedoCellEditing: true,
                    };

                    if (sortable) {
                        gridOptions.components = {
                            agColumnHeader: CellHeader,
                        };
                    }

                    new agGrid.Grid(grid, gridOptions);
                    this.gridOptions = gridOptions;
                    this.api = gridOptions.api;
                    this.api.hideOverlay();
                }

                let item = {};
                let k = 0;
                for (let j = 0; j < row.length; j += 2) {
                    //We append an index to each column name. This makes is possible to 
                    //display columns with same name. Refer cell renderer
                    item[`${row[j]}-${k}`] = row[j + 1];
                    k++;
                }

                this.api.applyTransactionAsync({ add: [item] });
                i++;
            }

            this.hideLoader();

            if (i == 0) {
                let gridOptions = {};

                new agGrid.Grid(grid, gridOptions);
                this.api = gridOptions.api;
                this.api.showNoRowsOverlay();
            }

            this.numOfRows = i;

            if (err == Err.ERR_NONE) {
                return {
                    'status': "ok",
                    'rows-affected': this.numOfRows
                }
            }

            return {
                'status': "error",
                'msg': err
            }
        }

        async update(stream) {
            //remove existing rows
            let rows = [];
            for (let i = 0; i < this.numOfRows; i++) {
                let n = this.api.rowModel.rowsToDisplay[i].data;
                rows.push(n);
            }

            this.api.applyTransactionAsync({ remove: rows });

            //start adding new rows
            this.showLoader();

            let err = Err.ERR_NONE;
            let i = 0;

            while (true) {
                let row;
                try {
                    row = await stream.get();
                } catch (e) {
                    PubSub.publish(Constants.STREAM_ERROR, {
                        'error': e
                    });
                    err = e;
                    break;
                }

                if (row.length == 1 && row[0] == "eos") {
                    break;
                }

                let item = {};
                let k = 0;
                for (let j = 0; j < row.length; j += 2) {
                    item[`${row[j]}-${k}`] = row[j + 1];
                    k++;
                }

                this.api.applyTransactionAsync({ add: [item] });
                i++;
            }

            this.numOfRows = i;

            this.hideLoader();

            if (err == Err.ERR_NONE) {
                return {
                    'status': "ok",
                    'rows-affected': this.numOfRows
                }
            }

            return {
                'status': "error",
                'msg': err
            }
        }

        undo() {
            this.undoStarted = true;
            this.api.undoCellEditing();
        }

        selectColumns(selection) {
            for (let col in selection) {
                this.gridOptions.columnApi.setColumnVisible(col, selection[col]);
            }
        }

        handleCellValueChanged(fkMap, params) {
            if (this.undoStarted) {
                //handleCellValueChanged will be called even after undo.
                //At that time we don't want to trigger cell_edited event
                this.undoStarted = false;
                return;
            }
            Log(TAG$d, "handleCellValueChanged");
            let key = fkMap['primary-key'];

            let keyId = fkMap['primary-key-id'];
            let keyValue = params.data[`${key}-${keyId}`];

            let colId = params.colDef.colId;
            let colField = params.colDef.field;
            let colValue = params.data[`${colField}-${colId}`];

            PubSub.publish(Constants.CELL_EDITED, {
                key: {
                    'name': key,
                    'value': keyValue,
                },
                col: {
                    'name': colField,
                    'value': colValue
                },
                cell: {
                    rowIndex: params.node.rowIndex,
                    colId: params.colDef.colId
                }
            });
        }

        showLoader() {
            //todo:this is very hackish. Must be accomplished with CSS alone
            let n = Utils.generateNode(this.$loaderTemplate, {});
            document.querySelector('body').append(n);
            let loader = document.querySelector('.table-loader');
            let dims = this.$root.getBoundingClientRect();
            loader.style.width = dims.width + 'px';
            loader.style.height = dims.height + 'px';
            loader.style.left = dims.left + 'px';
            loader.style.top = dims.top + 'px';
            let spinner = loader.querySelector('button');
            spinner.style.left = (dims.width / 2) + 'px';
            spinner.style.top = (dims.height / 4) + 'px';
        }

        hideLoader() {
            let loader = document.querySelector('.table-loader');
            loader.remove();
        }
    }

    /*!
     * hotkeys-js v3.8.7
     * A simple micro-library for defining and dispatching keyboard shortcuts. It has no dependencies.
     * 
     * Copyright (c) 2021 kenny wong <wowohoo@qq.com>
     * http://jaywcjlove.github.io/hotkeys
     * 
     * Licensed under the MIT license.
     */

    var isff = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase().indexOf('firefox') > 0 : false; // 绑定事件

    function addEvent(object, event, method) {
      if (object.addEventListener) {
        object.addEventListener(event, method, false);
      } else if (object.attachEvent) {
        object.attachEvent("on".concat(event), function () {
          method(window.event);
        });
      }
    } // 修饰键转换成对应的键码


    function getMods(modifier, key) {
      var mods = key.slice(0, key.length - 1);

      for (var i = 0; i < mods.length; i++) {
        mods[i] = modifier[mods[i].toLowerCase()];
      }

      return mods;
    } // 处理传的key字符串转换成数组


    function getKeys(key) {
      if (typeof key !== 'string') key = '';
      key = key.replace(/\s/g, ''); // 匹配任何空白字符,包括空格、制表符、换页符等等

      var keys = key.split(','); // 同时设置多个快捷键，以','分割

      var index = keys.lastIndexOf(''); // 快捷键可能包含','，需特殊处理

      for (; index >= 0;) {
        keys[index - 1] += ',';
        keys.splice(index, 1);
        index = keys.lastIndexOf('');
      }

      return keys;
    } // 比较修饰键的数组


    function compareArray(a1, a2) {
      var arr1 = a1.length >= a2.length ? a1 : a2;
      var arr2 = a1.length >= a2.length ? a2 : a1;
      var isIndex = true;

      for (var i = 0; i < arr1.length; i++) {
        if (arr2.indexOf(arr1[i]) === -1) isIndex = false;
      }

      return isIndex;
    }

    var _keyMap = {
      backspace: 8,
      tab: 9,
      clear: 12,
      enter: 13,
      return: 13,
      esc: 27,
      escape: 27,
      space: 32,
      left: 37,
      up: 38,
      right: 39,
      down: 40,
      del: 46,
      delete: 46,
      ins: 45,
      insert: 45,
      home: 36,
      end: 35,
      pageup: 33,
      pagedown: 34,
      capslock: 20,
      num_0: 96,
      num_1: 97,
      num_2: 98,
      num_3: 99,
      num_4: 100,
      num_5: 101,
      num_6: 102,
      num_7: 103,
      num_8: 104,
      num_9: 105,
      num_multiply: 106,
      num_add: 107,
      num_enter: 108,
      num_subtract: 109,
      num_decimal: 110,
      num_divide: 111,
      '⇪': 20,
      ',': 188,
      '.': 190,
      '/': 191,
      '`': 192,
      '-': isff ? 173 : 189,
      '=': isff ? 61 : 187,
      ';': isff ? 59 : 186,
      '\'': 222,
      '[': 219,
      ']': 221,
      '\\': 220
    }; // Modifier Keys

    var _modifier = {
      // shiftKey
      '⇧': 16,
      shift: 16,
      // altKey
      '⌥': 18,
      alt: 18,
      option: 18,
      // ctrlKey
      '⌃': 17,
      ctrl: 17,
      control: 17,
      // metaKey
      '⌘': 91,
      cmd: 91,
      command: 91
    };
    var modifierMap = {
      16: 'shiftKey',
      18: 'altKey',
      17: 'ctrlKey',
      91: 'metaKey',
      shiftKey: 16,
      ctrlKey: 17,
      altKey: 18,
      metaKey: 91
    };
    var _mods = {
      16: false,
      18: false,
      17: false,
      91: false
    };
    var _handlers = {}; // F1~F12 special key

    for (var k = 1; k < 20; k++) {
      _keyMap["f".concat(k)] = 111 + k;
    }

    var _downKeys = []; // 记录摁下的绑定键

    var _scope = 'all'; // 默认热键范围

    var elementHasBindEvent = []; // 已绑定事件的节点记录
    // 返回键码

    var code = function code(x) {
      return _keyMap[x.toLowerCase()] || _modifier[x.toLowerCase()] || x.toUpperCase().charCodeAt(0);
    }; // 设置获取当前范围（默认为'所有'）


    function setScope(scope) {
      _scope = scope || 'all';
    } // 获取当前范围


    function getScope() {
      return _scope || 'all';
    } // 获取摁下绑定键的键值


    function getPressedKeyCodes() {
      return _downKeys.slice(0);
    } // 表单控件控件判断 返回 Boolean
    // hotkey is effective only when filter return true


    function filter(event) {
      var target = event.target || event.srcElement;
      var tagName = target.tagName;
      var flag = true; // ignore: isContentEditable === 'true', <input> and <textarea> when readOnly state is false, <select>

      if (target.isContentEditable || (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') && !target.readOnly) {
        flag = false;
      }

      return flag;
    } // 判断摁下的键是否为某个键，返回true或者false


    function isPressed(keyCode) {
      if (typeof keyCode === 'string') {
        keyCode = code(keyCode); // 转换成键码
      }

      return _downKeys.indexOf(keyCode) !== -1;
    } // 循环删除handlers中的所有 scope(范围)


    function deleteScope(scope, newScope) {
      var handlers;
      var i; // 没有指定scope，获取scope

      if (!scope) scope = getScope();

      for (var key in _handlers) {
        if (Object.prototype.hasOwnProperty.call(_handlers, key)) {
          handlers = _handlers[key];

          for (i = 0; i < handlers.length;) {
            if (handlers[i].scope === scope) handlers.splice(i, 1);else i++;
          }
        }
      } // 如果scope被删除，将scope重置为all


      if (getScope() === scope) setScope(newScope || 'all');
    } // 清除修饰键


    function clearModifier(event) {
      var key = event.keyCode || event.which || event.charCode;

      var i = _downKeys.indexOf(key); // 从列表中清除按压过的键


      if (i >= 0) {
        _downKeys.splice(i, 1);
      } // 特殊处理 cmmand 键，在 cmmand 组合快捷键 keyup 只执行一次的问题


      if (event.key && event.key.toLowerCase() === 'meta') {
        _downKeys.splice(0, _downKeys.length);
      } // 修饰键 shiftKey altKey ctrlKey (command||metaKey) 清除


      if (key === 93 || key === 224) key = 91;

      if (key in _mods) {
        _mods[key] = false; // 将修饰键重置为false

        for (var k in _modifier) {
          if (_modifier[k] === key) hotkeys[k] = false;
        }
      }
    }

    function unbind(keysInfo) {
      // unbind(), unbind all keys
      if (!keysInfo) {
        Object.keys(_handlers).forEach(function (key) {
          return delete _handlers[key];
        });
      } else if (Array.isArray(keysInfo)) {
        // support like : unbind([{key: 'ctrl+a', scope: 's1'}, {key: 'ctrl-a', scope: 's2', splitKey: '-'}])
        keysInfo.forEach(function (info) {
          if (info.key) eachUnbind(info);
        });
      } else if (typeof keysInfo === 'object') {
        // support like unbind({key: 'ctrl+a, ctrl+b', scope:'abc'})
        if (keysInfo.key) eachUnbind(keysInfo);
      } else if (typeof keysInfo === 'string') {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        // support old method
        // eslint-disable-line
        var scope = args[0],
            method = args[1];

        if (typeof scope === 'function') {
          method = scope;
          scope = '';
        }

        eachUnbind({
          key: keysInfo,
          scope: scope,
          method: method,
          splitKey: '+'
        });
      }
    } // 解除绑定某个范围的快捷键


    var eachUnbind = function eachUnbind(_ref) {
      var key = _ref.key,
          scope = _ref.scope,
          method = _ref.method,
          _ref$splitKey = _ref.splitKey,
          splitKey = _ref$splitKey === void 0 ? '+' : _ref$splitKey;
      var multipleKeys = getKeys(key);
      multipleKeys.forEach(function (originKey) {
        var unbindKeys = originKey.split(splitKey);
        var len = unbindKeys.length;
        var lastKey = unbindKeys[len - 1];
        var keyCode = lastKey === '*' ? '*' : code(lastKey);
        if (!_handlers[keyCode]) return; // 判断是否传入范围，没有就获取范围

        if (!scope) scope = getScope();
        var mods = len > 1 ? getMods(_modifier, unbindKeys) : [];
        _handlers[keyCode] = _handlers[keyCode].map(function (record) {
          // 通过函数判断，是否解除绑定，函数相等直接返回
          var isMatchingMethod = method ? record.method === method : true;

          if (isMatchingMethod && record.scope === scope && compareArray(record.mods, mods)) {
            return {};
          }

          return record;
        });
      });
    }; // 对监听对应快捷键的回调函数进行处理


    function eventHandler(event, handler, scope) {
      var modifiersMatch; // 看它是否在当前范围

      if (handler.scope === scope || handler.scope === 'all') {
        // 检查是否匹配修饰符（如果有返回true）
        modifiersMatch = handler.mods.length > 0;

        for (var y in _mods) {
          if (Object.prototype.hasOwnProperty.call(_mods, y)) {
            if (!_mods[y] && handler.mods.indexOf(+y) > -1 || _mods[y] && handler.mods.indexOf(+y) === -1) {
              modifiersMatch = false;
            }
          }
        } // 调用处理程序，如果是修饰键不做处理


        if (handler.mods.length === 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91] || modifiersMatch || handler.shortcut === '*') {
          if (handler.method(event, handler) === false) {
            if (event.preventDefault) event.preventDefault();else event.returnValue = false;
            if (event.stopPropagation) event.stopPropagation();
            if (event.cancelBubble) event.cancelBubble = true;
          }
        }
      }
    } // 处理keydown事件


    function dispatch(event) {
      var asterisk = _handlers['*'];
      var key = event.keyCode || event.which || event.charCode; // 表单控件过滤 默认表单控件不触发快捷键

      if (!hotkeys.filter.call(this, event)) return; // Gecko(Firefox)的command键值224，在Webkit(Chrome)中保持一致
      // Webkit左右 command 键值不一样

      if (key === 93 || key === 224) key = 91;
      /**
       * Collect bound keys
       * If an Input Method Editor is processing key input and the event is keydown, return 229.
       * https://stackoverflow.com/questions/25043934/is-it-ok-to-ignore-keydown-events-with-keycode-229
       * http://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
       */

      if (_downKeys.indexOf(key) === -1 && key !== 229) _downKeys.push(key);
      /**
       * Jest test cases are required.
       * ===============================
       */

      ['ctrlKey', 'altKey', 'shiftKey', 'metaKey'].forEach(function (keyName) {
        var keyNum = modifierMap[keyName];

        if (event[keyName] && _downKeys.indexOf(keyNum) === -1) {
          _downKeys.push(keyNum);
        } else if (!event[keyName] && _downKeys.indexOf(keyNum) > -1) {
          _downKeys.splice(_downKeys.indexOf(keyNum), 1);
        } else if (keyName === 'metaKey' && event[keyName] && _downKeys.length === 3) {
          /**
           * Fix if Command is pressed:
           * ===============================
           */
          if (!(event.ctrlKey || event.shiftKey || event.altKey)) {
            _downKeys = _downKeys.slice(_downKeys.indexOf(keyNum));
          }
        }
      });
      /**
       * -------------------------------
       */

      if (key in _mods) {
        _mods[key] = true; // 将特殊字符的key注册到 hotkeys 上

        for (var k in _modifier) {
          if (_modifier[k] === key) hotkeys[k] = true;
        }

        if (!asterisk) return;
      } // 将 modifierMap 里面的修饰键绑定到 event 中


      for (var e in _mods) {
        if (Object.prototype.hasOwnProperty.call(_mods, e)) {
          _mods[e] = event[modifierMap[e]];
        }
      }
      /**
       * https://github.com/jaywcjlove/hotkeys/pull/129
       * This solves the issue in Firefox on Windows where hotkeys corresponding to special characters would not trigger.
       * An example of this is ctrl+alt+m on a Swedish keyboard which is used to type μ.
       * Browser support: https://caniuse.com/#feat=keyboardevent-getmodifierstate
       */


      if (event.getModifierState && !(event.altKey && !event.ctrlKey) && event.getModifierState('AltGraph')) {
        if (_downKeys.indexOf(17) === -1) {
          _downKeys.push(17);
        }

        if (_downKeys.indexOf(18) === -1) {
          _downKeys.push(18);
        }

        _mods[17] = true;
        _mods[18] = true;
      } // 获取范围 默认为 `all`


      var scope = getScope(); // 对任何快捷键都需要做的处理

      if (asterisk) {
        for (var i = 0; i < asterisk.length; i++) {
          if (asterisk[i].scope === scope && (event.type === 'keydown' && asterisk[i].keydown || event.type === 'keyup' && asterisk[i].keyup)) {
            eventHandler(event, asterisk[i], scope);
          }
        }
      } // key 不在 _handlers 中返回


      if (!(key in _handlers)) return;

      for (var _i = 0; _i < _handlers[key].length; _i++) {
        if (event.type === 'keydown' && _handlers[key][_i].keydown || event.type === 'keyup' && _handlers[key][_i].keyup) {
          if (_handlers[key][_i].key) {
            var record = _handlers[key][_i];
            var splitKey = record.splitKey;
            var keyShortcut = record.key.split(splitKey);
            var _downKeysCurrent = []; // 记录当前按键键值

            for (var a = 0; a < keyShortcut.length; a++) {
              _downKeysCurrent.push(code(keyShortcut[a]));
            }

            if (_downKeysCurrent.sort().join('') === _downKeys.sort().join('')) {
              // 找到处理内容
              eventHandler(event, record, scope);
            }
          }
        }
      }
    } // 判断 element 是否已经绑定事件


    function isElementBind(element) {
      return elementHasBindEvent.indexOf(element) > -1;
    }

    function hotkeys(key, option, method) {
      _downKeys = [];
      var keys = getKeys(key); // 需要处理的快捷键列表

      var mods = [];
      var scope = 'all'; // scope默认为all，所有范围都有效

      var element = document; // 快捷键事件绑定节点

      var i = 0;
      var keyup = false;
      var keydown = true;
      var splitKey = '+'; // 对为设定范围的判断

      if (method === undefined && typeof option === 'function') {
        method = option;
      }

      if (Object.prototype.toString.call(option) === '[object Object]') {
        if (option.scope) scope = option.scope; // eslint-disable-line

        if (option.element) element = option.element; // eslint-disable-line

        if (option.keyup) keyup = option.keyup; // eslint-disable-line

        if (option.keydown !== undefined) keydown = option.keydown; // eslint-disable-line

        if (typeof option.splitKey === 'string') splitKey = option.splitKey; // eslint-disable-line
      }

      if (typeof option === 'string') scope = option; // 对于每个快捷键进行处理

      for (; i < keys.length; i++) {
        key = keys[i].split(splitKey); // 按键列表

        mods = []; // 如果是组合快捷键取得组合快捷键

        if (key.length > 1) mods = getMods(_modifier, key); // 将非修饰键转化为键码

        key = key[key.length - 1];
        key = key === '*' ? '*' : code(key); // *表示匹配所有快捷键
        // 判断key是否在_handlers中，不在就赋一个空数组

        if (!(key in _handlers)) _handlers[key] = [];

        _handlers[key].push({
          keyup: keyup,
          keydown: keydown,
          scope: scope,
          mods: mods,
          shortcut: keys[i],
          method: method,
          key: keys[i],
          splitKey: splitKey
        });
      } // 在全局document上设置快捷键


      if (typeof element !== 'undefined' && !isElementBind(element) && window) {
        elementHasBindEvent.push(element);
        addEvent(element, 'keydown', function (e) {
          dispatch(e);
        });
        addEvent(window, 'focus', function () {
          _downKeys = [];
        });
        addEvent(element, 'keyup', function (e) {
          dispatch(e);
          clearModifier(e);
        });
      }
    }

    var _api = {
      setScope: setScope,
      getScope: getScope,
      deleteScope: deleteScope,
      getPressedKeyCodes: getPressedKeyCodes,
      isPressed: isPressed,
      filter: filter,
      unbind: unbind
    };

    for (var a in _api) {
      if (Object.prototype.hasOwnProperty.call(_api, a)) {
        hotkeys[a] = _api[a];
      }
    }

    if (typeof window !== 'undefined') {
      var _hotkeys = window.hotkeys;

      hotkeys.noConflict = function (deep) {
        if (deep && window.hotkeys === hotkeys) {
          window.hotkeys = _hotkeys;
        }

        return hotkeys;
      };

      window.hotkeys = hotkeys;
    }

    class Hotkeys {
        static init() {
            hotkeys(Constants.SHIFT_R, () => {
                PubSub.publish(Constants.CMD_RUN_QUERY, {});
            });

            hotkeys(Constants.SHIFT_F, () => {
                PubSub.publish(Constants.CMD_FORMAT_QUERY, {});
            });

            hotkeys(Constants.SHIFT_N, () => {
                PubSub.publish(Constants.CMD_NEXT_ROWS, {});
            });

            hotkeys(Constants.SHIFT_P, () => {
                PubSub.publish(Constants.CMD_PREV_ROWS, {});
            });

            hotkeys(Constants.SHIFT_E, () => {
                PubSub.publish(Constants.CMD_EXPORT, {});
            });

            hotkeys(Constants.SHIFT_L, () => {
                PubSub.publish(Constants.CMD_EXPORT_TABLE , {});
            });

            hotkeys(Constants.SHIFT_S, () => {
                PubSub.publish(Constants.CMD_SEARCH_TABLES , {});
            });

            hotkeys(Constants.SHIFT_BACK, () => {
                PubSub.publish(Constants.CMD_BACK , {});
            });
        }
    }

    const TAG$c = "row-adder";

    class RowAdder {
        constructor(sessionId) {
            this.sessionId = sessionId;

            this.$add = document.getElementById('add-row');
            this.$dialog = document.getElementById('row-adder-dialog');
            this.$cancel = this.$dialog.querySelector('.cancel');
            this.$ok = this.$dialog.querySelector('.ok');
            this.templ = this.$dialog.querySelector('#col-input-template').innerHTML;
            this.$body = this.$dialog.querySelector('.modal-card-body');
            this.$title = this.$dialog.querySelector('.modal-card-title');

            this.$add.addEventListener('click', () => {
                if (this.table == null || this.columns == null) {
                    return;
                }

                this.$title.innerHTML = `Add new row to ${this.table}`;
                this.$body.replaceChildren();
                Log(TAG$c, this.columns);
                this.$dialog.classList.add('is-active');
                this.columns.forEach((c) => {
                    let n = Utils.generateNode(this.templ, {
                        col: c
                    });
                    this.$body.append(n);
                });
            });

            this.$ok.addEventListener('click', async () => {
                let cols = [];
                let vals = [];
                let $inputs = this.$dialog.querySelectorAll('input');

                $inputs.forEach((e) => {
                    let v = e.value;
                    if (v) {
                        cols.push(e.dataset.col);
                        vals.push(v);
                    }
                });

                Log(TAG$c, `cols: ${cols}`);
                Log(TAG$c, `vals: ${vals}`);
                cols = cols.map(e => `\`${e}\``).join(",");
                vals = vals.map(e => `'${e}'`).join(",");

                let query = `insert into \`${this.table}\` (${cols}) values (${vals})`;
                Log(TAG$c, query);

                let dbUtils = new DbUtils();
                let res = await dbUtils.execute.apply(this, [query]);

                if (res.status == "ok") {
                    PubSub.publish(Constants.QUERY_DISPATCHED, {
                        query: query,
                        tags: [Constants.USER]
                    });

                    let rows = res.data[0][1];
                    Utils.showAlert(`Inserted ${rows} ${rows == "1" ? "row" : "rows"}`, 2000);
                    this.$dialog.classList.remove('is-active');
                    return;
                }

                alert(res.msg);
            });

            this.$cancel.addEventListener('click', () => {
                this.$dialog.classList.remove('is-active');
            });
        }

        setSessionId(sessionId) {
            this.sessionId = sessionId;
        }

        init(table, columns) {
            this.table = table;
            this.columns = columns;
        }
    }

    const TAG$b = "col-selector";

    class ColumnSelector {
        constructor() {
            let selections = Utils.getFromLocalStorage(Constants.COLUMN_SELECTIONS);
            if (selections) {
                this.selections = JSON.parse(selections);
            } else {
                this.selections = {};
            }

            this.$selCols = document.getElementById('select-cols');
            this.$dialog = document.getElementById('column-selector-dialog');
            this.$cancel = this.$dialog.querySelector('.cancel');
            this.$ok = this.$dialog.querySelector('.ok');
            this.templ = this.$dialog.querySelector('#col-select-template').innerHTML;
            this.$body = this.$dialog.querySelectorAll('.modal-card-body')[1];
            this.$title = this.$dialog.querySelector('.modal-card-title');
            this.$checkAll = this.$dialog.querySelector('.checkall');

            this.$selCols.addEventListener('click', () => {
                if (this.table == null || this.columns == null) {
                    alert('No table selected');
                    return;
                }

                this.$title.innerHTML = `Select columns from ${this.table} to display`;
                this.$body.replaceChildren();
                Log(TAG$b, this.columns);

                let selection = this.selections[this.table] ?? {};

                let allChecked = true;

                for (let i = 0; i < this.columns.length; i++) {
                    let c = this.columns[i];
                    let n = Utils.generateNode(this.templ, {
                        col: c
                    });

                    let checked = selection[i] ?? true;
                    if (!checked) {
                        allChecked = false;
                    }
                    n.querySelector('.checkbox').checked = checked;

                    this.$body.append(n);
                }

                this.$checkAll.checked = allChecked;

                this.$dialog.classList.add('is-active');
            });

            this.$checkAll.addEventListener('change', () => {
                let $inputs = this.$body.querySelectorAll('input');
                if (this.$checkAll.checked) {
                    $inputs.forEach((i) => {
                        i.checked = true;
                    });

                    return;
                }

                $inputs.forEach((i) => {
                    i.checked = false;
                });
            });

            this.$ok.addEventListener('click', async () => {
                let selection = {};
                let $inputs = this.$body.querySelectorAll('input');
                //column ids are in sequence
                let id = 0;
                $inputs.forEach((e) => {
                    if (e.checked) {
                        selection[id] = true;
                    } else {
                        selection[id] = false;
                    }
                    id++;
                });

                Log(TAG$b, JSON.stringify(selections));
                PubSub.publish(Constants.COLUMNS_SELECTED, {
                    cols: selection
                });

                this.selections[this.table] = selection;
                Utils.saveToLocalStorage(Constants.COLUMN_SELECTIONS, JSON.stringify(this.selections));

                this.$dialog.classList.remove('is-active');
            });

            this.$cancel.addEventListener('click', () => {
                this.$dialog.classList.remove('is-active');
            });
        }

        init(table, columns) {
            this.table = table;
            this.columns = columns;
        }

        getSelection(table) {
            return this.selections[table] ?? {};
        }
    }

    const TAG$a = "table-info";

    class TableInfo {
        constructor(sessionId) {
            this.sessionId = sessionId;

            this.$info = document.getElementById('table-info');
            this.$dialog = document.getElementById('table-info-dialog');
            //this.$cancel = this.$dialog.querySelector('.cancel');
            this.$ok = this.$dialog.querySelector('.ok');
            this.$body = this.$dialog.querySelector('.modal-card-body');
            this.$title = this.$dialog.querySelector('.modal-card-title');

            this.$info.addEventListener('click', () => {
                if (this.table == null) {
                    return;
                }

                this.$title.innerHTML = `${this.table}`;
                this.$body.replaceChildren();
                this.$body.innerHTML = this.createQuery;
                Log(TAG$a, this.columns);
                this.$dialog.classList.add('is-active');
            });

            this.$ok.addEventListener('click', async () => {
                this.$dialog.classList.remove('is-active');
            });

            //this.$cancel.addEventListener('click', () => {
                //this.$dialog.classList.remove('is-active');
            //});

            PubSub.subscribe(Constants.TABLE_CHANGED, (data) => {
                this.table = data.table;
                this.fetchQuery();
            });

            PubSub.subscribe(Constants.TABLE_SELECTED, (data) => {
                this.table = data.table;
                this.fetchQuery();
            });
        }

        async fetchQuery() {
            let res = await DbUtils.fetchAll(this.sessionId, `show create table \`${this.table}\``);
            Log(TAG$a, JSON.stringify(res));
            this.createQuery = `<pre> ${res[0][3]} </pre>`;
        }

        setSessionId(sessionId) {
            this.sessionId = sessionId;
        }
    }

    class Pager {
        constructor() {
            document.addEventListener('DOMContentLoaded', async () => {
                this.$next = document.getElementById('next');
                this.$prev = document.getElementById('prev');

                this.$next.addEventListener('click', async (e) => {
                    this.handleCmd(Constants.CMD_NEXT_ROWS);
                });

                this.$prev.addEventListener('click', async (e) => {
                    this.handleCmd(Constants.CMD_PREV_ROWS);
                });
            });

            [
                Constants.CMD_NEXT_ROWS,
                Constants.CMD_PREV_ROWS,
            ].forEach((c) => {
                ((c) => {
                    PubSub.subscribe(c, () => {
                        this.handleCmd(c);
                    });
                })(c);
            });
        }

        reset() {
            this.page = 0;
            this.$prev.classList.add('pager-disable');
            this.sortColumn = '';
            this.sortOrder = '';
            this.query = '';
        }

        setQuery(query) {
            this.query = query;
        }

        setSortInfo(col, order) {
            this.sortColumn = col;
            this.sortOrder = order;
        }

        init(query, renderFunc, sortColumn = null, sortOrder = null) {
            this.page = 0;
            this.query = query;
            this.sortColumn = sortColumn;
            this.sortOrder = sortOrder;
            this.renderFunc = renderFunc;

            this.$prev.classList.add('pager-disable');
            query = 
                `${this.query} ${DbUtils.getOrder(this.sortColumn, this.sortOrder)} limit ${DbUtils.getLimit(this.page, 0)}`;
            this.renderFunc(query);
        }

        async handleCmd(cmd) {
            switch (cmd) {
                case Constants.CMD_NEXT_ROWS:
                    this.handleNextRows();
                    break;

                case Constants.CMD_PREV_ROWS:
                    this.handlePrevNows();
                    break;
            }
        }

        async handleNextRows() {
            if (this.inFlight) {
                return;
            }

            this.inFlight = true;

            let query = 
                `${this.query} ${DbUtils.getOrder(this.sortColumn, this.sortOrder)} limit ${DbUtils.getLimit(this.page, 1)}`;

            let res = await this.renderFunc(query);
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

            let query = 
                `${this.query} ${DbUtils.getOrder(this.sortColumn, this.sortOrder)} limit ${DbUtils.getLimit(this.page, -1)}`;

            let res = await this.renderFunc(query);
            if (res.status == "ok") {
                this.page--;
                if (this.page == 0) {
                    this.$prev.classList.add('pager-disable');
                }
            }

            this.inFlight = false;
        }
    }

    let pager = new Pager();

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
    ];

    const TAG$9 = "table-contents";

    class TableContents {
        constructor(sessionId) {
            Log(TAG$9, `sessionId: ${sessionId}`);

            this.sessionId = sessionId;
            this.init();
        }

        //public method
        setSessionInfo(sessionId, db) {
            this.sessionId = sessionId;
            this.db = db;
            this.rowAdder.setSessionId(this.sessionId);
            this.tableInfo.setSessionId(this.sessionId);

            Log(TAG$9, `sessionId: ${sessionId} db: ${db}`);
        }

        async init() {
            Hotkeys.init();
            this.rowAdder = new RowAdder(this.sessionId);
            this.tableInfo = new TableInfo(this.sessionId);
            this.colSelector = new ColumnSelector();

            this.initDom();

            this.stack = new Stack(async (e) => {
                await this.navigate(e);
            });

            this.tableUtils = new TableUtils(this.$contents);

            this.initSubscribers();
            this.initHandlers();
        }

        initDom() {
            this.$columNames = document.getElementById('column-names');
            this.$operators = document.getElementById('operators');
            this.$searchText = document.getElementById('search-text');
            this.$search = document.getElementById('search');
            this.$tableContents = document.getElementById('table-contents');
            this.$contents = document.getElementById('table-contents');
            this.$exportFiltered = document.getElementById('export-filtered-results');
            this.$clearFilter = document.getElementById('clear-filter');
        }

        initSubscribers() {
            PubSub.subscribe(Constants.STREAM_ERROR, (err) => {
                Log(TAG$9, `${Constants.STREAM_ERROR}: ${JSON.stringify(err)}`);
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
                })(c);
            });

            PubSub.subscribe(Constants.CELL_EDITED, async (data) => {
                Log(TAG$9, Constants.CELL_EDITED);
                await this.handleCellEdit(data);
            });
        }

        async initHandlers() {
            this.$search.addEventListener('click', async () => {
                this.search();
                this.stack.push(this.table, this.$columNames.value, this.$operators.value, this.$searchText.value);
            });

            this.$searchText.addEventListener('keyup', async (e) => {
                if (this.$searchText.value) {
                    this.$clearFilter.style.display = 'block';
                } else {
                    this.$clearFilter.style.display = 'none';
                }

                if (e.key == "Enter") {
                    this.search();
                    this.stack.push(this.table, this.$columNames.value, this.$operators.value, this.$searchText.value);
                }
            });

            this.$tableContents.addEventListener('click', async (e) => {
                Log(TAG$9, "clicked");
                let target = event.target;
                if (!target.classList.contains('fk-icon')) {
                    return
                }

                let value = target.dataset.value;

                Log(TAG$9, `${target.dataset.table}:${target.dataset.column}:${value}`);
                PubSub.publish(Constants.TABLE_CHANGED, {table: target.dataset.table});
                await this.showFkRef(target.dataset.table, target.dataset.column, value);
                this.stack.push(target.dataset.table, target.dataset.column, value);
            });

            this.$operators.addEventListener('change', () => {
                if (this.$operators.value == "IS NULL" || this.$operators.value == "IS NOT NULL") {
                    this.$searchText.disabled = true;
                    return;
                }
                this.$searchText.disabled = false;
            });

            this.$exportFiltered.addEventListener('click', async (e) => {
                this.handleCmd(Constants.CMD_EXPORT);
            });

            this.$clearFilter.addEventListener('click', async (e) => {
                this.handleCmd(Constants.CMD_CLEAR_FILTER);
            });
        }

        async handleSort(data) {
            Log(TAG$9, JSON.stringify(data));
            this.sortColumn = data.column;
            this.sortOrder = data.order;

            const f = async (query) => {
                return await this.updateContents(query);
            };

            pager.init(this.query, f, this.sortColumn, this.sortOrder);
        }

        async handleCellEdit(data) {
            Log(TAG$9, JSON.stringify(data));
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

                if (rows == 0) {
                    this.tableUtils.undo();
                }
                return;
            }

            this.tableUtils.undo();
        }

        async showFkRef(table, col, val) {
            this.table = table;

            await this.initTable(this.table);
            this.rowAdder.init(this.table, this.columns);
            this.colSelector.init(this.table, this.columns);

            let query = `select * from \`${table}\` 
                         where \`${col}\` = '${val}'`;

            const f = async (query) => {
                let res = await this.showContents(query, this.fkMap);

                if (res.status == "ok") {
                    PubSub.publish(Constants.QUERY_DISPATCHED, {
                        query: query,
                        tags: [Constants.USER]
                    });

                }
                return res
            };

            pager.init(query, f);
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

            Log(TAG$9, this.query);

            const f = async (query) => {
                let res = await this.showContents(query, this.fkMap);

                if (res.status == "ok") {
                    PubSub.publish(Constants.QUERY_DISPATCHED, {
                        query: this.query,
                        tags: [Constants.USER]
                    });
                }

                return res;
            };

            pager.init(this.query, f);
        }

        reset() {
            this.sortColumn = null;
            this.sortOrder = null;
        }

        async show(table) {
            this.table = table;

            Log(TAG$9, `Displaying ${table}`);

            this.stack.reset();
            this.stack.push(this.table);

            await this.initTable(this.table);
            this.rowAdder.init(this.table, this.columns);
            this.colSelector.init(this.table, this.columns);

            //the base query currently in operation
            this.query = `select * from \`${this.table}\``;

            const f = async (query) => {
                let res = this.showContents(query, this.fkMap);
                return res;
            };

            Log(TAG$9, `${this.sortColumn}:${this.sortOrder}`);
            pager.init(this.query, f, this.sortColumn, this.sortOrder);
        }

        async initTable(table) {
            let columns = DbUtils.fetchAll(this.sessionId, `show columns from \`${table}\``);
            let contraints = DbUtils.fetchAll(this.sessionId, `SELECT
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE
                TABLE_SCHEMA = '${this.db}\' and
                TABLE_NAME = '${table}\'`);

            let values = await Promise.all([columns, contraints]);
            this.fkMap = DbUtils.createFKMap(values[1]);
            this.columns = Utils.extractColumns(values[0]);

            //update the column name selector
            Utils.setOptions(this.$columNames, this.columns, '');
            Utils.setOptions(this.$operators, OPERATORS, '');
            this.$searchText.value = '';
        }

        async showContents(query, fkMap, sel = true) {
            this.cursorId = await DbUtils.fetchCursorId(this.sessionId, query);

            let params = {
                'session-id': this.sessionId,
                'cursor-id': this.cursorId,
                'req-id': Utils.uuid(),
                'num-of-rows': Constants.BATCH_SIZE_WS
            };

            let stream = new Stream(Constants.WS_URL + '/fetch_ws?' + new URLSearchParams(params));
            let selection = this.colSelector.getSelection(this.table);
            let res =  await this.tableUtils.showContents(stream, fkMap, selection, true, true);

            return res;
        }

        async updateContents(query) {
            this.cursorId = await DbUtils.fetchCursorId(this.sessionId, query);
            let params = {
                'session-id': this.sessionId,
                'cursor-id': this.cursorId,
                'req-id': Utils.uuid(),
                'num-of-rows': Constants.BATCH_SIZE_WS
            };

            let stream = new Stream(Constants.WS_URL + '/fetch_ws?' + new URLSearchParams(params));
            return this.tableUtils.update(stream);
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
            Utils.setOptions(this.$columNames, this.columns, '');
            Utils.setOptions(this.$operators, OPERATORS, '');

            this.$searchText.value = '';
            this.$searchText.focus();

            this.$clearFilter.style.display = 'none';

            if (this.table) {
                this.show(this.table);
            }
        }

        async handleExport() {
            if (!this.query) {
                return;
            }

            let dbUtils = new DbUtils();
            let res = await dbUtils.exportResults.apply(this, [this.query]);

            if (res.status == "ok") {
                PubSub.publish(Constants.QUERY_DISPATCHED, {
                    query: this.query,
                    tags: [Constants.USER]
                });
            }
        }

        async navigate(e) {
            Log(TAG$9, JSON.stringify(e));
            PubSub.publish(Constants.TABLE_CHANGED, {table: e.table});

            switch (e.type) {
                case 'table':
                    await this.show(e.table);
                    break

                case 'fk-ref':
                    await this.showFkRef(e.table, e.column, e.value);
                    break

                case 'search':
                    this.table = e.table;
                    await this.initTable(this.table);

                    this.$columNames.value = e.column;
                    this.$operators.value = e.operator;
                    this.$searchText.value = e.value;

                    await this.search();
                    break
            }
            Log(TAG$9, "Done navigate");
        }
    }

    const TAG$8 = "tables";

    class Tables {
        constructor(sessionId) {
            this.$root = document.getElementById('app-left-panel');
            this.sessionId = sessionId;
            this.$tables = document.getElementById('tables');
            this.$tableFilter = document.getElementById('table-filter');
            this.$exportTable = document.getElementById('export-table');
            this.$tableFilter.addEventListener('keyup', () => {
                this.filter();
            });

            this.$exportTable.addEventListener('click', () => {
                this.handleCmd(Constants.CMD_EXPORT_TABLE);
            });

            this.$tables.addEventListener('click', async (e) => {
                let target = e.target;
                if (target.className != 'table-name') {
                    return
                }

                //remove highlight on all element first
                let list = this.$tables.querySelectorAll('.highlight');
                list.forEach((e) => {
                    e.classList.remove('highlight');
                });

                let parent = target.parentElement;
                parent.classList.add('highlight');

                this.table = target.innerHTML;

                PubSub.publish(Constants.TABLE_SELECTED, {table: target.innerHTML});
            });

            //update highlighted table if table is changed from elsewhere
            PubSub.subscribe(Constants.TABLE_CHANGED, (data) => {
                //remove highlight on all element first
                let list = this.$tables.querySelectorAll('.highlight');
                list.forEach((e) => {
                    e.classList.remove('highlight');
                });

                //highlight new table
                list = this.$tables.querySelectorAll('.table-name');
                for (let i = 0; i < list.length; i++) {
                    if (list[i].innerHTML == data.table) {
                        let parent = list[i].parentElement;
                        parent.classList.add('highlight');
                        break;
                    }
                }
            });

            Log(TAG$8, `sessionId: ${sessionId}`);
            //handle all keyboard shortcuts
            [
                Constants.CMD_EXPORT_TABLE,
                Constants.CMD_SEARCH_TABLES
            ].forEach((c) => {
                ((c) => {
                    PubSub.subscribe(c, () => {
                        this.handleCmd(c);
                    });
                })(c);
            });
        }

        async handleCmd(cmd) {
            switch (cmd) {
            case Constants.CMD_EXPORT_TABLE:
                this.handleExportTable();
                break;

            case Constants.CMD_SEARCH_TABLES:
                this.$tableFilter.focus();
                break;
            }
        }

        async handleExportTable() {
            if (!this.table) {
                alert('No table selected');
                return
            }

            let q = `select * from \`${this.table}\``;
            let dbUtils = new DbUtils();
            dbUtils.exportResults.apply(this, [q]);
        }

        setSessionInfo(sessionId, db) {
            this.sessionId = sessionId;
            this.db = db;
            Log(TAG$8, `sessionId: ${sessionId} db: ${db}`);
        }

        filter() {
            let f = this.$tableFilter.value;

            if (f == '') {
                this.render(this.tables);
                return
            }

            Log(TAG$8, `Filtering ${f}`);

            let regex = new RegExp(`${f}`);
            let tables = this.tables.filter(t => regex.test(t));
            this.render(tables);
        }

        async show(db) {
            Log(TAG$8, "show");
            let q = `show tables from \`${db}\``;
            let cursorId = await DbUtils.fetchCursorId(this.sessionId, q);

            let params = {
                'session-id': this.sessionId,
                'cursor-id': cursorId,
                'req-id': Utils.uuid(),
                'num-of-rows': -1 //get all table names
            };

            let stream = new Stream(Constants.WS_URL + '/fetch_ws?' + new URLSearchParams(params));

            this.$tables.replaceChildren();
            let $t = document.getElementById('table-template');
            let t = $t.innerHTML;

            this.tables = [];

            while (true) {
                let row = await stream.get();

                if (row.length == 1 && row[0] == "eos") {
                    break;
                }

                let h = Utils.generateNode(t, {table: row[1]});
                this.$tables.append(h);
                this.tables.push(row[1]);
            }
        }

        render(tables) {
            this.$tables.replaceChildren();
            let $t = document.getElementById('table-template');
            let t = $t.innerHTML;

            tables.forEach((tbl) => {
                let h = Utils.generateNode(t, {table: tbl});
                this.$tables.append(h);
            });
        }
    }

    const TAG$7 = "grid-resizer";
    class GridResizerH {
        //resize two elements contained in grid horizontal direction
        constructor($grid, $e1, $resizer, $e2) {
            this.d1 = $e1.getBoundingClientRect().width;
            this.d2 = $e2.getBoundingClientRect().width;

            Log(TAG$7, `${this.d1} ${this.d2}`);

            $resizer.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                this.startx = e.clientX;
                Log(TAG$7, `mousedown: ${e.clientX}`);
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!this.isDragging) {
                    return;
                }
                Log(TAG$7, `mousemove: ${e.clientX}`);
                let delta = e.clientX - this.startx;
                this.d1 += delta;
                this.d2 += -1 * delta;
                Log(TAG$7, `${delta} ${this.d1} ${this.d2}`);

                $grid.style.gridTemplateColumns = `${this.d1}px 2px ${this.d2}px`;
                this.startx = e.clientX;
                e.preventDefault();
            });

            document.addEventListener('mouseup', (e) => {
                this.isDragging = false;
                Log(TAG$7, `mouseup: ${e.clientX}`);
                e.preventDefault();
                PubSub.publish(Constants.GRID_H_RESIZED, {});
            });
        }
    }

    const TAG$6 = "main-menu";
    class MainMenu {
        static init() {
    		let elementsArray = document.querySelectorAll('[id$="-menu"]');

            elementsArray.forEach((elem) => {
                elem.addEventListener("click", (e) => {
                    Log(TAG$6, `${e.currentTarget.id} clicked `);
                    MainMenu.handleMenu(e.currentTarget.id);
                });
            });
        }

    	static handleMenu(id) {
    		switch (id) {
    		case 'query-menu':
    			window.location = '/app/queries';
    			break;

    		case 'content-menu':
    			window.location = '/app/tables';
    			break;

    		case 'help-menu':
    			window.location = '/app/help';
    			break;

    		case 'about-menu':
    			window.location = '/app/about';
    			break;
    		}
    	}
    }

    const TAG$5 = "appbar";
    class AppBar {
        static init(name, sessionId, db) {
            let $databases = document.getElementById('databases');
            document.getElementById('conn-name').innerHTML = name;

            AppBar.showDatabases($databases, sessionId, db);

            $databases.addEventListener('change', () => {
                Log(TAG$5, "Db changed");
                let db = $databases.value;
                PubSub.publish(Constants.DB_CHANGED, {db: db});
            });
        }

        static async showDatabases($databases, sessionId, db) {
            let dbs = await DbUtils.fetchAll(sessionId, 'show databases');
            dbs = Utils.extractColumns(dbs);
            Utils.setOptions($databases, dbs, db);
            //PubSub.publish(Constants.DB_CHANGED, {db: db});
        }
    }

    const TAG$4 = "base-db";
    class BaseDB {
        constructor(options) {
            this.version = options.version;
            this.dbName = options.dbName;
        }

        async open() {
            return new Promise((resolve, reject) => {
                let req = indexedDB.open(this.dbName, this.version);
                    req.onsuccess = (e) => {
                        Log(TAG$4, "open.onsuccess");
                        this.db = req.result;
                        resolve(0);
                    };

                    req.onerror = (e) => {
                        Log(TAG$4, "open.onerror");
                        reject(e.target.errorCode);
                    };

                    req.onupgradeneeded = (evt) => {
                        this.onUpgrade(evt);
                    };
            })
        }

        async save(store, rec) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction([store], "readwrite");

                let objectStore = transaction.objectStore(store);
                let request = objectStore.add(rec);
                request.onsuccess = (e) => {
                    resolve(e.target.result);
                };

                request.onerror = (e) => {
                    Log(TAG$4, e.target.error);
                    resolve(-1);
                };
            })
        }

        async put(store, rec) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction([store], "readwrite");
                let objectStore = transaction.objectStore(store);

                let request = objectStore.put(rec);
                request.onsuccess = (e) => {
                    resolve(0);
                };

                request.onerror = (e) => {
                    Log(TAG$4, e.target.error);
                    resolve(-1);
                };
            })
        }

        async del(id) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store, "readwrite");
                let objectStore = transaction.objectStore(this.store);
                let request = objectStore.delete(id);

                request.onsuccess = (e) => {
                    resolve(0);
                };

                request.onerror = (e) => {
                    resolve(e.target.error);
                };
            })
        }

        async get(id) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store);
                let objectStore = transaction.objectStore(this.store);
                let request = objectStore.get(id);

                request.onsuccess = (e) => {
                    resolve(request.result);
                };

                request.onerror = (e) => {
                    resolve(null);
                };
            })
        }

        async getAll() {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store);
                let objectStore = transaction.objectStore(this.store);

                let results = [];
                objectStore.openCursor().onsuccess = (e) => {
                    var cursor = e.target.result;
                    if (cursor) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };
            })
        }
    }

    const TAG$3 = "query-db";
    const CREATED_AT_INDEX = "created-at-index";
    const QUERY_INDEX = "query-index";
    const TERM_INDEX = "term-index";
    const TAG_INDEX = "tag-index";

    class QueryDB extends BaseDB {
        constructor(options) {
            options.dbName = "queries";
            super(options);
            this.store = "queries";
            this.searchIndex = "search-index";
            this.tagIndex = "tag-index";
        }

        onUpgrade(evt) {
            Log(TAG$3, "open.onupgradeneeded");
            let store = evt.target.result.createObjectStore(
                this.store, { keyPath: 'id', autoIncrement: true });
            store.createIndex(CREATED_AT_INDEX, "created_at", { unique : false });

            store = evt.target.result.createObjectStore(
                this.searchIndex, { keyPath: 'id', autoIncrement: true });
            store.createIndex(TERM_INDEX, "term", { unique : true });

            store = evt.target.result.createObjectStore(
                this.tagIndex, { keyPath: 'id', autoIncrement: true });
            store.createIndex(TAG_INDEX, "tag", { unique : true });
        }

        async save(rec) {
            return new Promise(async (resolve, reject) => {
                //remove all new lines
                rec.query = rec.query.replace(/\r?\n|\r/g, " ");
                //remove extra white spaces
                rec.query = rec.query.replace(/[ ]{2,}/g, " ");
                let terms = rec.query.split(' ');

                //get all unique terms
                //https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
                terms = [...new Set(terms)];

                Log(TAG$3, JSON.stringify(terms));
                let id = -1;
                try {
                    //apppend timestamp if required
                    if (!rec.created_at) {
                        rec.created_at = new Date();
                    }

                    id = await super.save(this.store, rec);
                    if (id == -1) {
                        resolve(-1);
                        return;
                    }

                    await this.updateSearchIndex(id, terms);
                    await this.updateTagIndex(id, rec.tags);

                    resolve(id);
                } catch (e) {
                    Log(TAG$3, `error: ${JSON.stringify(e.message)}`);
                    reject(e.message);
                }
            })
        }

        async updateSearchIndex(id, terms) {
            //add id to each of the tags
            for (let i = 0; i < terms.length; i++) {
                let t = terms[i];
                t = t.trim();

                if (t.length <= 1) {
                    continue;
                }

                t = this.cleanup(t);
                try {
                    let rec = await this.findByTerm(t);
                    //add a new tag
                    if (rec == null) {
                        await super.save(this.searchIndex, {
                            term: t,
                            queries:[id]
                        });
                        continue;
                    }

                    //update tag
                    rec['queries'].push(id);
                    Log(TAG$3, JSON.stringify(rec));
                    super.put(this.searchIndex, {
                        id: rec.id,
                        term: t,
                        queries: rec['queries']
                    });

                } catch (e) {
                    Log(TAG$3, `error: e.message`);
                }
            }
        }

        async findByTerm(term) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.searchIndex);
                let objectStore = transaction.objectStore(this.searchIndex);
                let index = objectStore.index(TERM_INDEX);

                let key = IDBKeyRange.only(term);
                index.openCursor(key).onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        Log(TAG$3, JSON.stringify(cursor.value));
                        resolve(cursor.value);
                        return;
                    }

                    resolve(null);
                };
            })
        }

        async updateTagIndex(id, tags) {
            //add id to each of the tags
            for (let i = 0; i < tags.length; i++) {
                let t = tags[i];
                t = t.trim();

                if (t.length <= 1) {
                    continue;
                }

                t = this.cleanup(t);
                try {
                    let rec = await this.findByTag(t);
                    //add a new tag
                    if (rec == null) {
                        await super.save(this.tagIndex, {
                            tag: t,
                            queries:[id]
                        });
                        continue;
                    }

                    //update tag
                    rec['queries'].push(id);
                    Log(TAG$3, JSON.stringify(rec));
                    super.put(this.tagIndex, {
                        id: rec.id,
                        tag: t,
                        queries: rec['queries']
                    });

                } catch (e) {
                    Log(TAG$3, `error: e.message`);
                }
            }
        }

        async findByTag(tag) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.tagIndex);
                let objectStore = transaction.objectStore(this.tagIndex);
                let index = objectStore.index(TAG_INDEX);

                let key = IDBKeyRange.only(tag);
                index.openCursor(key).onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        Log(TAG$3, JSON.stringify(cursor.value));
                        resolve(cursor.value);
                        return;
                    }

                    resolve(null);
                };
            })
        }

        async findByQuery(query) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.dbName);
                let objectStore = transaction.objectStore(this.store);
                let index = objectStore.index(QUERY_INDEX);

                let key = IDBKeyRange.only(query);
                index.openCursor(key).onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        Log(TAG$3, JSON.stringify(cursor.value));
                        resolve(cursor.value);
                        return;
                    }

                    resolve([]);
                };
            })
        }

        //https://stackoverflow.com/questions/26156292/trim-specific-character-from-a-string
        cleanup(str) {
            //remove table qualifiers like table_name.<...>
            str = str.replace(/^\S+\./, "");

            //remove punctuation marks
            let chars = ['`', '`', ' ', '"', '\'', ',', ';', '+', '-', '=', '!=', '<', '>', '>=', '<='];
            let start = 0, 
                end = str.length;

            while(start < end && chars.indexOf(str[start]) >= 0)
                ++start;

            while(end > start && chars.indexOf(str[end - 1]) >= 0)
                --end;

            return (start > 0 || end < str.length) ? str.substring(start, end) : str;
        }

        async filter(days, tags, terms) {
            //days supercedes everything
            //if days are provided get queries by days first
            //then filter by terms and tags if provided
            let start, end;
            if (days.hasOwnProperty('start')) {
                start = new Date(Date.now() - (days.start * 24 * 60 * 60 * 1000));
                start.setHours(0);
                start.setMinutes(0);
                start.setSeconds(0);
            }

            if (days.hasOwnProperty('end')) {
                end = new Date(Date.now() - (days.end * 24 * 60 * 60 * 1000));
                end.setHours(23);
                end.setMinutes(59);
                end.setSeconds(59);
            }

            let result = [];
            if (start || end) {
                Log(TAG$3, 'filtering');
                result = await this.searchByCreatedAt(start, end);

                if (result.length == 0) {
                    //if days were provided and we did not find anything
                    //no need to process further
                    return [];
                }
            }

            if (tags.length > 0) {
                let idsByTag = await this.searchByTags(tags);

                result = result.filter(x => idsByTag.includes(x));
                if (result.length == 0) {
                    //no need to process further
                    return [];
                }
            }

            if (terms.length > 0) {
                let idsByTerm = await this.searchByTerms(terms);

                result = result.filter(x => idsByTerm.includes(x));
                if (result.length == 0) {
                    //no need to process further
                    return [];
                }
            }

            return await this.findByIds(result);
        }

        findByIds(ids) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store);
                let objectStore = transaction.objectStore(this.store);
                let queries = [];

                objectStore.openCursor(null, 'prev').onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        if (ids.includes(cursor.value.id)) {
                            queries.push(cursor.value);
                        }
                        cursor.continue();
                    } else {
                        resolve(queries);
                    }
                };
            });
        }

        async updateTags(rec) {
            await super.put(this.store, rec);
            await this.updateTagIndex(rec.id, rec.tags);
        }

        searchByTerms(terms) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.searchIndex);
                let objectStore = transaction.objectStore(this.searchIndex);
                let ids = [];

                objectStore.openCursor().onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        if (terms.includes(cursor.value.term)) {
                            ids = ids.concat(cursor.value.queries);
                        }
                        cursor.continue();
                    } else {
                        resolve(ids);
                    }
                };
            });
        }

        searchByTags(tags) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.tagIndex);
                let objectStore = transaction.objectStore(this.tagIndex);
                let ids = [];

                objectStore.openCursor().onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        if (tags.includes(cursor.value.tag)) {
                            ids = ids.concat(cursor.value.queries);
                        }
                        cursor.continue();
                    } else {
                        resolve(ids);
                    }
                };
            });
        } 

        listTags(startingWith) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.tagIndex);
                let objectStore = transaction.objectStore(this.tagIndex);
                let index = objectStore.index(TAG_INDEX);
                let tags = [];

                IDBKeyRange.lowerBound(startingWith);
                index.openCursor().onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        tags.push(cursor.value.tag);
                        cursor.continue();
                    } else {
                        resolve(tags);
                    }
                };
            });
        }

        listTerms(startingWith) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.searchIndex);
                let objectStore = transaction.objectStore(this.searchIndex);
                let index = objectStore.index(TERM_INDEX);
                let terms = [];

                IDBKeyRange.lowerBound(startingWith);
                index.openCursor().onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        terms.push(cursor.value.term);
                        cursor.continue();
                    } else {
                        resolve(terms);
                    }
                };
            });
        }

        searchByCreatedAt(s, e) {
            return new Promise((resolve, reject) => {
                let transaction = this.db.transaction(this.store);
                let objectStore = transaction.objectStore(this.store);
                let index = objectStore.index(CREATED_AT_INDEX);

                // s -----> e ----> now
                let key;
                if (s && e) {
                    key = IDBKeyRange.bound(s, e);
                } else if (s) {
                    key = IDBKeyRange.lowerBound(s);
                } else if (e) {
                    key = IDBKeyRange.upperBound(e);
                } else {
                    resolve([]);
                    return;
                }

                let queries = [];
                index.openCursor(key).onsuccess = (ev) => {
                    let cursor = ev.target.result;
                    if (cursor) {
                        queries.push(cursor.value.id);
                        cursor.continue();
                    } else {
                        resolve(queries);
                    }
                };
            });
        }
    }

    /*Copyright 2017 Kenneth Jiang

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE*/

    //https://github.com/kennethjiang/js-file-download/blob/master/file-download.js

    class FileDownloader {
    	static download(data, filename, mime, bom) {
    		var blobData = (typeof bom !== 'undefined') ? [bom, data] : [data];
    		var blob = new Blob(blobData, {type: mime || 'application/octet-stream'});
    		if (typeof window.navigator.msSaveBlob !== 'undefined') {
    			// IE workaround for "HTML7007: One or more blob URLs were
    			// revoked by closing the blob for which they were created.
    			// These URLs will no longer resolve as the data backing
    			// the URL has been freed."
    			window.navigator.msSaveBlob(blob, filename);
    		}
    		else {
    			var blobURL = (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
    			var tempLink = document.createElement('a');
    			tempLink.style.display = 'none';
    			tempLink.href = blobURL;
    			tempLink.setAttribute('download', filename);

    			// Safari thinks _blank anchor are pop ups. We only want to set _blank
    			// target if the browser does not support the HTML5 download attribute.
    			// This allows you to download files in desktop safari if pop up blocking
    			// is enabled.
    			if (typeof tempLink.download === 'undefined') {
    				tempLink.setAttribute('target', '_blank');
    			}

    			document.body.appendChild(tempLink);
    			tempLink.click();

    			// Fixes "webkit blob resource error 1"
    			setTimeout(function() {
    				document.body.removeChild(tempLink);
    				window.URL.revokeObjectURL(blobURL);
    			}, 200);
    		}
    	}
    }

    const TAG$2 = "file-uploader";

    class FileUploader {
        constructor() {
            //todo: get rid of the fu thing. not required
            this.mID = 'fu-' + Utils.uuid();

            let tmpl = document.getElementById('file-upload-template').innerHTML;
            let n = Utils.generateNode(tmpl, {
                'fu-id': this.mID,
            });
            
            document.querySelector('body').append(n);
            document.querySelector('[type=file]').addEventListener("change", (e) => {
                Log(TAG$2, 'changed');
    	
                if (e.target.files.length > 0) {
                    let reader = new FileReader();
                    reader.readAsText(e.target.files[0]);

                    reader.addEventListener('load', () => {
                        try {
                            let result = JSON.parse(reader.result);
                            PubSub.publish(Constants.FILE_UPLOADED, result);
                        } catch (e) {
                            alert(e);
                            return;
                        } finally {
                            //self destruct
                            document.querySelector(`#${this.mID}`).remove();
                        }
                    });
                }
            });
        }

        show() {
            Log(TAG$2, "Showing " + this.mID);
            document.querySelector('[type=file]').click();
        }
    }

    const TAG$1 = "query-history";
    const MAX_DAYS = 10000;

    class QueryHistory {
        constructor() {
            PubSub.subscribe(Constants.QUERY_DISPATCHED, async (query) => {
                Log(TAG$1, JSON.stringify(query));

                if (!this.queryDb) {
                    await this.init();
                }

                let id = await this.queryDb.save(query); 
                Log(TAG$1, `Saved to ${id}`);
                PubSub.publish(Constants.QUERY_SAVED, {id: id});
            });

            PubSub.subscribe(Constants.FILE_UPLOADED, async (data) => {
                await this.handleUpload(data);
            });

            let $download = document.getElementById('download-history');
            if ($download) {
                //download icon is not present on content page
                $download.addEventListener('click', async () => {
                    await this.handleDownload();
                });

                document.getElementById('import-file').addEventListener('click', async () => {
                    let uploader = new FileUploader();
                    uploader.show();
                });
            }
        }

        async init() {
            this.queryDb = new QueryDB({version: Constants.QUERY_DB_VERSION});
            await this.queryDb.open();
        }

        async handleDownload() {
            let queries = await this.queryDb.filter({start: MAX_DAYS, end: 0}, [], []);
            for (let i = 0; i < queries.length; i++) {
                let q = queries[i];
                let year = q.created_at.getFullYear();
                let month = q.created_at.getMonth();
                let date = q.created_at.getDate();
                let hours = q.created_at.getHours();
                let minutes = q.created_at.getMinutes();
                let seconds = q.created_at.getSeconds();

                queries[i]['year'] = year;
                queries[i]['month'] = month;
                queries[i]['date'] = date;
                queries[i]['hours'] = hours;
                queries[i]['minutes'] = minutes;
                queries[i]['seconds'] = seconds;

                delete(queries[i].created_at);
            }

            FileDownloader.download(JSON.stringify(queries), 'data.json', 'application/json');
        }

        async handleUpload(data) {
            progressBar.setOptions({});//no buttons
            PubSub.publish(Constants.INIT_PROGRESS, {});
            PubSub.publish(Constants.START_PROGRESS, {});

            for (let i = 0; i < data.length; i++) {
                let d = data[i];
                if (d.id) {
                    delete(d.id);
                }

                let createdAt = new Date();
                createdAt.setFullYear(d.year);
                createdAt.setMonth(d.month);
                createdAt.setDate(d.date);
                createdAt.setHours(d.hours);
                createdAt.setMinutes(d.minutes);
                createdAt.setSeconds(d.seconds);

                delete(d.year);
                delete(d.month);
                delete(d.date);
                delete(d.hours);
                delete(d.minutes);
                delete(d.seconds);
                d.created_at = createdAt;
                let id = await this.queryDb.save(d);

                PubSub.publish(Constants.UPDATE_PROGRESS, {
                    message: `Imported ${i + 1} of ${data.length}`
                });

                Log(TAG$1, `Saved to ${id}`);
            }
            PubSub.publish(Constants.STOP_PROGRESS, {});
        }
    }

    const TAG = "content";
    class Content {
        constructor() {
            document.addEventListener('DOMContentLoaded', async () => {
                this.adjustView();
                this.init();
            });
        }

        async initHandlers() {
            PubSub.subscribe(Constants.DB_CHANGED, async (data) => {
                Log(TAG, "Db changed");
                this.creds.db = data.db;
                Utils.saveToSession(Constants.CREDS, JSON.stringify(this.creds));

                //if db has changed we have to create new session
                this.sessionId = await DbUtils.login(this.creds);

                //update session id in all modules
                this.tableContents.setSessionInfo(this.sessionId, this.creds.db);
                this.tables.setSessionInfo(this.sessionId, this.creds.db);

                this.tables.show(this.creds.db);
            });

            this.$tables = document.getElementById('tables');

            PubSub.subscribe(Constants.TABLE_SELECTED, (data) => {
                this.tableContents.reset();
                this.tableContents.show(data.table);
            });
        }

        async init() {
            MainMenu.init();
            this.history = new QueryHistory();

            let creds = Utils.getFromSession(Constants.CREDS);
            if (!creds) {
                window.location = '/login';
                return
            }

            Log(TAG, JSON.stringify(creds));

            this.creds = JSON.parse(creds);
            this.sessionId = await DbUtils.login(this.creds);
            Log(TAG, this.sessionId);

            this.tableContents = new TableContents(this.sessionId);
            this.tables = new Tables(this.sessionId);

            this.initHandlers();

            AppBar.init(this.creds.name, this.sessionId, this.creds.db);

            if (this.creds.db) {
                this.tableContents.setSessionInfo(this.sessionId, this.creds.db);
                this.tables.setSessionInfo(this.sessionId, this.creds.db);
                this.tables.show(this.creds.db);
            }

            let $g1 = document.getElementById('app-content');
            let $e1 = document.getElementById('app-left-panel-container');
            let $e2 = document.getElementById('app-right-panel');
            let $resizer = document.getElementById('app-content-resizer');
            new GridResizerH($g1, $e1, $resizer, $e2);
        }

        adjustView() {
            let bodyDims = document.querySelector('body').getBoundingClientRect();
            let appbarDims = document.querySelector('#appbar').getBoundingClientRect();
            let appLeftPanel = document.querySelector('#app-left-panel');
            appLeftPanel.style.height = (bodyDims.height - appbarDims.height) + 'px';

            let appRightPanel = document.getElementById('app-right-panel');
            appRightPanel.style.height = (bodyDims.height - appbarDims.height) + 'px';
        }
    }

    new Content();

}());
