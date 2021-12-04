(function () {
    'use strict';

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

        static get DB_ID_INDEX() {
            return "db-id-index";
        }

        static get QUERY_DB_VERSION() {
            return 37;
        }

        static get CONN_DB_VERSION() {
            return 4
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

        static get DEBUG_LOG() {
            return "worker.debug-log"
        }

        static get NEW_CONNECTION() {
            return "worker.new-connection"
        }

        static get NEW_QUERIES() {
            return "worker.new-queries"
        }

        static get STATUS_ACTIVE() {
            return "active"
        }

        static get STATUS_DELETED() {
            return "deleted"
        }
    }

    const DISABLED = [
        'grid-resizer',
        //'query-db',
        //'query-finder',
    ];

    //workers do not support console.log. How to debug ? 
    // We send a message to the module that initiated worker and 
    // have it print the debug log
    // But sending message requires port which is available only in 
    // worker. How to use a common logger for entire system?
    // We create static "Log" method which can use used for all code that 
    // does not get directly called from worker. For any code that gets
    // called from worker we use the "log" method.

    class Logger {
        constructor(port = null) {
            this.port = port;
        }

        log(tag, str) {
            if (DISABLED.includes(tag)) {
                return;
            }

            if (this.port) {
                this.port.postMessage({
                    type: Constants.DEBUG_LOG,
                    payload: `${tag}: ${str}`
                });
                return
            }

            Logger.print(tag, str);
        }

        static Log(tag, str) {
            if (DISABLED.includes(tag)) {
                return;
            }

            Logger.print(tag, str);
        }

        static print(tag, str) {
            let [month, date, year]    = new Date().toLocaleDateString("en-US").split("/");
            let [hour, minute, second] = new Date().toLocaleTimeString("en-US").split(/:| /);

            let o = `${date}-${month}-${year} ${hour}:${minute}:${second}:::${tag}: ${str}`;
            console.log(o);
        }
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

    const TAG = "utils";
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

        static async fetch(url, handleError = true, headers = {}) {
            try {
                let hdrs = {
                    'X-Request-ID': Utils.uuid()
                };
                hdrs = {...hdrs, ...headers};
                let response = await fetch(url, {
                    headers: hdrs
                });

                Logger.Log(TAG, response);

                let json = await response.json();

                if (json.status == 'error') {
                    throw json
                }

                return json
            } catch (e) {
                Logger.Log(TAG, e);
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
            Logger.Log(TAG, "No data");
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

        static getTimestamp() {
            let d = (new Date()).toISOString();
            return d.replace(/T/, ' ').replace(/\..*$/, '');
        }

    	static getRandomIntegerInclusive(min, max) {
    		return Math.floor(Math.random() * (max - min + 1)) + min;
    	}
    }

    class Monitor {
        static async isAgentInstalled() {
            let response = await Utils.fetch(Constants.URL + '/about', false);
            if (response.status == "ok") {
                return true;
            }

            return false;
        }
    }

    class Index {
        constructor() {
            document.addEventListener('DOMContentLoaded', async () => {
                this.init();

                this.$getStarted.addEventListener('click', async () => {
                    this.getStarted();
                });
            });
        }

        init() {
            this.$getStarted = document.getElementById('get-started');
        }

        async getStarted() {
            if (await Monitor.isAgentInstalled()) {
                window.location = '/login';
                return;
            }

            window.location = '/install';
        }
    }

    new Index();

}());
