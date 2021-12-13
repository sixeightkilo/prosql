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

        static get CONNECTION_SAVED() {
            return 'connection-saved'
        }

        static get CONNECTION_DELETED() {
            return 'connection-deleted'
        }

        static get QUERY_UPDATED() {
            return 'query-updated'
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

        static get CONNECTIONS_META_KEY() {
            return 1;
        }

        static get QUERIES_META_KEY() {
            return 2;
        }

        static get CONNECTIONS_META_DB_VERSION() {
            return 1;
        }

        static get QUERIES_META_DB_VERSION() {
            return 1;
        }

        static get QUERY_DB_VERSION() {
            return 39;
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

        static get NEW_CONNECTIONS() {
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

        static get EPOCH_TIMESTAMP() {
            return '2021-01-01T00:00:00Z';
        }

        static get LAST_SYNC_TS() {
            return 'last-sync-ts';
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

    const TAG = "tabs";

    class Tabs {
        constructor() {
            document.addEventListener('DOMContentLoaded', async () => {
                Logger.Log(TAG, 'DOMContentLoaded');
                this.$tabs = document.querySelector('.tabs');
                this.$contents = document.querySelectorAll('.tab-content');
                this.init();
            });
        }

        init() {
            let list = this.$tabs.querySelectorAll('li');
            list.forEach((t) => {
                t.addEventListener('click', (e) => {
                    let li = e.target.parentElement;
                    if (li.classList.contains('is-active')) {
                        return;
                    }

                    //disable currently active tab
                    this.$tabs.querySelector('.is-active').classList.remove('is-active');
                    this.$contents.forEach((e) => {
                        e.style.display = "none";
                    });

                    //activate current tab
                    li.classList.add('is-active');

                    //and the content
                    let target = e.target;
                    Logger.Log(TAG, target.className);
                    this.$contents.forEach(($c) => {
                        if ($c.classList.contains(`${target.className}`)) {
                            $c.style.display = "block";
                        }
                    });
                });
            });
        }
    }

    class Help {
        constructor() {
            document.addEventListener('DOMContentLoaded', async () => {
                let $contact = document.querySelector('.contact');
                $contact.classList.remove('is-hidden');
            });

            new Tabs();
        }
    }

    new Help();

}());
