import { Logger } from './logger.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'
import { QueryDB } from './query-db.js'

const TAG = "workers"
class Workers {
    constructor() {
        this.$version = document.getElementById('version')
        Logger.Log(TAG, `ver: ${this.$version.value}`);
    }

    async initDb() {
        this.queryDb = new QueryDB(new Logger(), {version: Constants.QUERY_DB_VERSION});
        await this.queryDb.open();
    }

    initConnectionWorker() {
        //init must be called after dom is loaded
        this.connectionWorker = new SharedWorker(`/build-0.6/dist/js/connection-worker.js?ver=${this.$version.value}`);
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

        this.queryWorker = new SharedWorker(`/build-0.6/dist/js/query-worker.js?ver=${this.$version.value}`);
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
