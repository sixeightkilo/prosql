import { Utils } from './utils.js'
import { Constants } from './constants.js'

class DbUtils {

    static async fetch(sessionId, query) {
        let params = {
            'session-id': sessionId,
            query: query
        }

        let json = await Utils.fetch(Constants.URL + '/execute?' + new URLSearchParams(params))
        let cursorId = json.data

        params = {
            'session-id': sessionId,
            'cursor-id': json.data,
            'num-of-rows': Constants.BATCH_SIZE
        }

        json = await Utils.fetch(Constants.URL + '/fetch?' + new URLSearchParams(params))
        return json.data
    }

    static async fetchAll(sessionId, query) {
        let params = {
            'session-id': sessionId,
            query: query
        }

        let json = await Utils.fetch(Constants.URL + '/execute?' + new URLSearchParams(params))
        let cursorId = json.data

        params = {
            'session-id': sessionId,
            'cursor-id': json.data,
            'num-of-rows': Constants.BATCH_SIZE
        }

        let eof = false
        let rows = []

        do {
            json = await Utils.fetch(Constants.URL + '/fetch?' + new URLSearchParams(params))
            if (json['error-code']) {
                break
            }
            console.log(JSON.stringify(json))
            rows = rows.concat(json.data)
            eof = json.eof
        } while (!eof)

        return rows
    }

    static async getDatabases(sessionId) {
        let params = {
            'session-id': sessionId,
            query: 'show databases'
        }

        let json = await Utils.fetch(Constants.URL + '/execute?' + new URLSearchParams(params))
        let cursorId = json.data

        params = {
            'session-id': sessionId,
            'cursor-id': json.data,
            'num-of-rows': Constants.BATCH_SIZE
        }

        let eof = false
        let dbs = []

        do {
            json = await Utils.fetch(Constants.URL + '/fetch?' + new URLSearchParams(params))
            if (json['error-code']) {
                break
            }
            console.log(JSON.stringify(json))
            dbs = dbs.concat(json.data)
            eof = json.eof
        } while (!eof)

        return dbs
    }

    static async getTables(sessionId, db) {
        let params = {
            'session-id': sessionId,
            query: `show tables from \`${db}\``
        }

        let json = await Utils.fetch(Constants.URL + '/execute?' + new URLSearchParams(params))
        let cursorId = json.data

        params = {
            'session-id': sessionId,
            'cursor-id': json.data,
            'num-of-rows': Constants.BATCH_SIZE
        }

        let eof = false
        let tables = []

        do {
            json = await Utils.fetch(Constants.URL + '/fetch?' + new URLSearchParams(params))
            if (json['error-code']) {
                break
            }

            tables = tables.concat(json.data)
            eof = json.eof
        } while (!eof)

        return tables
    }
}
export { DbUtils }
