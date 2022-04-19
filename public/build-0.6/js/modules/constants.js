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

    static get UP_ARROW() {
        return 38;
    }

    static get DOWN_ARROW() {
        return 40;
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
    static get GRID_HAS_FOCUS() {
        return 'grid-has-focus'
    }

    static get SEARCH_BAR_HAS_FOCUS() {
        return 'search-bar-has-focus'
    }

    static get DB_RENAMED() {
        return 'db-menu.db-renamed'
    }

    static get DB_DELETED() {
        return 'db-menu.db-deleted'
    }

    static get TABLE_RENAMED() {
        return 'ops-menu.table-renamed'
    }

    static get TABLE_TRUNCATED() {
        return 'ops-menu.table-truncated'
    }

    static get ROW_SELECTED() {
        return 'table-utils.row-selected'
    }

    static get ROW_DELETED() {
        return 'row-deleter.row-deleted'
    }

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

    static get TABLE_UNSELECTED() {
        return 'tables.table-unselected'
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

    static get SIGNIN_REQUIRED() {
        return "worker.signin-required"
    }

    static get NEW_CONNECTIONS() {
        return "worker.new-connection"
    }

    static get NEW_QUERIES() {
        return "worker.new-queries"
    }

    static get EXECUTE_SAVE_REC() {
        return "worker.execute-save-rec"
    }

    static get EXECUTE_SUCCESS() {
        return "app.execute-success"
    }

    static get EXECUTE_ERROR() {
        return "app.execute-error"
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
export { Constants }
