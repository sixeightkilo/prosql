class Constants {
    //events
    static get STREAM_ERROR() {
        return 'stream.stream-error'
    }

    static get TABLE_SELECTED() {
        return 'tables.table-selected'
    }

    static get TABLE_CHANGED() {
        return 'table-contents.table-changed'
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

    static get BATCH_SIZE() {
        return 1000
    }

    static get CREDS() {
        return 'creds'
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

    static get SYSTEM() {
        return 'system'
    }

    static get USER() {
        return 'user'
    }

    static get QUERY_DB_VERSION() {
        return 2
    }
}
export { Constants }
