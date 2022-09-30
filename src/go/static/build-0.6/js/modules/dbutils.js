import { Err } from './error.js'
import { Logger } from './logger.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'
import { Stream } from './stream.js'
import { PubSub } from './pubsub.js'
import ProgressBar from './progress-bar.js'

const TAG = "dbutils"
class DbUtils {

    //todo: use WS in fetchall and get rid of fetch route from agent
    static async fetchAll(sessionId, query, handleError = false) {
        let params = {
            'session-id': sessionId,
            query: query
        }

        let json = await Utils.get(Constants.URL + '/query?' + new URLSearchParams(params), handleError)
        Logger.Log(TAG, JSON.stringify(json))
        if (json.status == 'error') {
            Logger.Log(TAG, JSON.stringify(json))
            throw json.msg
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
            json = await Utils.get(Constants.URL + '/fetch?' + new URLSearchParams(params), handleError)
            if (json.status == "error") {
                Logger.Log(TAG, JSON.stringify(json))
                throw json.msg
            }

            Logger.Log(TAG, JSON.stringify(json))
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
        let json = await Utils.get(Constants.URL + '/login?' + new URLSearchParams(creds))
        if (json.status == 'error') {
            Logger.Log(TAG, JSON.stringify(json))
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

        return await Utils.get(Constants.URL + '/fetch?' + new URLSearchParams(params));
    }

    static async cancel(sessionId, cursorId) {
        let params = {
            'session-id': sessionId,
            'cursor-id': cursorId,
        }

        await Utils.get(Constants.URL + '/cancel?' + new URLSearchParams(params));
    }

    static async fetchCursorId(sessionId, query, execute = false) {
        let q = encodeURIComponent(query);
        let params = {
            'session-id': sessionId,
            query: q
        }

        if (execute) {
            let json = await Utils.get(Constants.URL + '/execute?' + new URLSearchParams(params));
            return json.data['cursor-id']
        }

        let json = await Utils.get(Constants.URL + '/query?' + new URLSearchParams(params));
        return json.data['cursor-id']
    }

    async exportResults(q) {
        let cursorId = await DbUtils.fetchCursorId(this.sessionId, q)
        Logger.Log(TAG, `cursorId: ${cursorId}`);
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
                Logger.Log(TAG, `Cancelled ${cursorId}`);
            }
        });

        PubSub.publish(Constants.INIT_PROGRESS, {
            title: `Running query`,
            message: `Please wait`
        });

        let csv = '';
        let fileName = '';
        let n = 0;
        let err = Err.ERR_NONE;
        let template = document.getElementById('copy-filename-template').innerHTML;

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

                let html = Utils.processTemplate(template, {
                    text: `Exporting to ${fileName}`,
                    'file-name': fileName
                });
                PubSub.publish(Constants.START_PROGRESS, {
                    title: html
                });

                //If we are here query was OK, save to DB
                PubSub.publish(Constants.QUERY_DISPATCHED, {
                    query: q,
                    tags: [Constants.USER]
                })
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
        Logger.Log(TAG, JSON.stringify(constraints));
        let fkMap = {}

        if (constraints.length == 0) {
            return fkMap;
        }

        let colIndex, refTblIndex, refColIndex, constraintNameIndex

        //first get indexes of columns of interest
        let i = 0
        constraints[0].forEach((c) => {
            switch (c) {
                case 'CONSTRAINT_NAME':
                    constraintNameIndex = (i + 1)
                    break

                case 'COLUMN_NAME':
                    colIndex = (i + 1)
                    break

                case 'REFERENCED_TABLE_NAME':
                    refTblIndex = (i + 1)
                    break;

                case 'REFERENCED_COLUMN_NAME':
                    refColIndex = (i + 1)
                    break;
            }
            i++
        })

        //Now get values of columns for each row
        constraints.forEach((row) => {
            if (row[refTblIndex] != "NULL") {
                fkMap[row[colIndex]] = {
                    'ref-table': row[refTblIndex],
                    'ref-column': row[refColIndex],
                }
            }

            if (row[constraintNameIndex] == 'PRIMARY') {
                fkMap['primary-key'] = row[colIndex]
            }
        })

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

export { DbUtils }
