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

    static get ERR_SIGNIN_REQUIRED() {
        return 'signin-required'
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
            window.location = '/connections';
            return;
        }

        alert(err.error);
    }
}
export { Err }
