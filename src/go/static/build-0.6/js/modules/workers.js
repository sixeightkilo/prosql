import { Logger } from './logger.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'
import { QueryDB } from './query-db.js'

const TAG = "workers"
class Workers {
    constructor() {
        this.$rev = document.getElementById('rev')
        Logger.Log(TAG, `ver: ${this.$rev.value}`);
    }

    async initDb() {
        this.queryDb = new QueryDB(new Logger(), {version: Constants.QUERY_DB_VERSION});
        await this.queryDb.open();
    }

    initConnectionWorker() {
        //init must be called after dom is loaded
        //todo: the root of worker is harcoded. Should be taken from version
        this.connectionWorker = new SharedWorker(`/static/build-0.6/dist/js/connection-worker.js?rev=${this.$rev.value}`);
        this.connectionWorker.port.onmessage = (e) => {
            switch (e.data.type) {
                case Constants.DEBUG_LOG:
                    Logger.Log("connection-worker", e.data.payload);
                    break;

                case Constants.NEW_CONNECTIONS:
                    PubSub.publish(Constants.NEW_CONNECTIONS, {});
                    break;
            }
        }
    }

    async initQueryWorker() {
        await this.initDb();

        //todo: the root of worker is harcoded. Should be taken from version
        this.queryWorker = new SharedWorker(`/static/build-0.6/dist/js/query-worker.js?rev=${this.$rev.value}`);
        this.queryWorker.port.onmessage = async (e) => {
            switch (e.data.type) {
            case Constants.DEBUG_LOG:
                Logger.Log("query-worker", e.data.payload);
                break;

            case Constants.NEW_QUERIES:
                PubSub.publish(Constants.NEW_QUERIES, {});
                break;

            case Constants.EXECUTE_SAVE_REC:
                Logger.Log("query-worker", Constants.EXECUTE_SAVE_REC);
                let rec = e.data.data;
                rec.terms = Utils.getTerms(rec.query);
                let id = await this.queryDb.save(rec); 

                this.queryWorker.port.postMessage({
                    type: Constants.EXECUTE_SUCCESS,
                    data: id
                });
                break;
            }
        }
    }
}

export { Workers }
