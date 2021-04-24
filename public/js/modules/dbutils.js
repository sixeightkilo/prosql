import { Log } from './logger.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'

const TAG = "DbUtils"
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
        if (json.status == 'error') {
            Log(TAG, JSON.stringify(json))
            return []
        }

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
            if (json.status == "error") {
                Log(TAG, JSON.stringify(json))
                return []
            }

            Log(TAG, JSON.stringify(json))
            rows = rows.concat(json.data)
            eof = json.eof
        } while (!eof)

        return rows
    }

    static async login(creds) {
        let json = await Utils.fetch(Constants.URL + '/login?' + new URLSearchParams(creds))
        if (json.status == 'error') {
            Log(TAG, JSON.stringify(json))
            return ""
        }

        return json.data['session-id']
    }
}
export { DbUtils }
