import { Utils } from './utils.js'
import { Constants } from './constants.js'

class DbUtils {
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
            'num-of-rows': 100
        }

        let eof = false
        let dbs = []

        do {
            json = await Utils.fetch(Constants.URL + '/fetch?' + new URLSearchParams(params))
            console.log(JSON.stringify(json))
            dbs = dbs.concat(json.data)
            eof = json.eof
        } while (!eof)

        return dbs
    }
}
export { DbUtils }
