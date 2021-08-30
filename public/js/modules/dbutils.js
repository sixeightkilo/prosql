import { Err } from './error.js'
import { Log } from './logger.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'
import { Stream } from './stream.js'
import { PubSub } from './pubsub.js'
import ProgressBar from './progress-bar.js'

const TAG = "dbutils"
class DbUtils {

    //todo: use WS in fetchall and get rid of fetch route from agent
    static async fetchAll(sessionId, query) {
        let params = {
            'session-id': sessionId,
            query: query
        }

        let json = await Utils.fetch(Constants.URL + '/query?' + new URLSearchParams(params))
        if (json.status == 'error') {
            Log(TAG, JSON.stringify(json))
            return []
        }

        let cursorId = json.data['cursor-id']

        params = {
            'session-id': sessionId,
            'cursor-id': cursorId,
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
            if (!json.data) {
                //if batch size == num of rows in query result, then we might get json.data = null
                //but we should still return results fetched till this point
                return rows
            }
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

    async execute(query) {
        this.cursorId = await DbUtils.fetchCursorId(this.sessionId, query, true)

        let params = {
            'session-id': this.sessionId,
            'cursor-id': this.cursorId,
            'num-of-rows': -1,//not used
        }

        return await Utils.fetch(Constants.URL + '/fetch?' + new URLSearchParams(params));
    }

    static async cancel(sessionId, cursorId) {
        let params = {
            'session-id': sessionId,
            'cursor-id': cursorId,
        }

        await Utils.fetch(Constants.URL + '/cancel?' + new URLSearchParams(params));
    }

    static async fetchCursorId(sessionId, query, execute = false) {
        let q = encodeURIComponent(query);
        let params = {
            'session-id': sessionId,
            query: q
        }

        if (execute) {
            let json = await Utils.fetch(Constants.URL + '/execute?' + new URLSearchParams(params));
            return json.data['cursor-id']
        }

        let json = await Utils.fetch(Constants.URL + '/query?' + new URLSearchParams(params));
        return json.data['cursor-id']
    }

    async exportResults(q) {
        let cursorId = await DbUtils.fetchCursorId(this.sessionId, q)
        Log(TAG, `cursorId: ${cursorId}`);
        let params = {
            'session-id': this.sessionId,
            'cursor-id': cursorId,
            'req-id': Utils.uuid(),
            'num-of-rows': -1,
            'export': true
        }

        let stream = new Stream(Constants.WS_URL + '/fetch_ws?' + new URLSearchParams(params))
        let i = 1;

        ProgressBar.setOptions({
            buttons: true,
            cancel: () => {
                DbUtils.cancel(this.sessionId, cursorId)
                Log(TAG, `Cancelled ${cursorId}`);
            }
        });

        let csv = '';
        let fileName = '';
        let n = 0;
        let err = Err.ERR_NONE;

        while (true) {
            let row
            try {
                row = await stream.get();
            } catch (e) {
                PubSub.publish(Constants.STREAM_ERROR, {
                    'error': e
                });
                err = e
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
        return err
    }
}

export { DbUtils }
