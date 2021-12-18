import { Logger } from './logger.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'

const TAG = "workers"
class Workers {
    init() {
        //init must be called after dom is loaded
        this.$version = document.getElementById('version')
        Logger.Log(TAG, `ver: ${this.$version.value}`);
        this.connectionWorker = new SharedWorker(`/build-0.6/dist/js/connection-worker.js?ver=${this.$version.value}`);
        this.connectionWorker.port.onmessage = (e) => {
            switch (e.data.type) {
                case Constants.DEBUG_LOG:
                    Logger.Log("connection-worker", e.data.payload);
                    break;

                case Constants.NEW_CONNECTIONS:
                    PubSub.publish(Constants.NEW_CONNECTIONS, {});
                    break;

                case Constants.SIGNUP_REQUIRED:
                    Logger.Log(TAG, Constants.SIGNUP_REQUIRED);
                    PubSub.publish(Constants.SIGNUP_REQUIRED, {});
                    break;
            }
        }

        this.queryWorker = new SharedWorker(`/build-0.6/dist/js/query-worker.js?ver=${this.$version.value}`);
        this.queryWorker.port.onmessage = (e) => {
            switch (e.data.type) {
                case Constants.DEBUG_LOG:
                    Logger.Log("query-worker", e.data.payload);
                    break;

                case Constants.NEW_QUERIES:
                    PubSub.publish(Constants.NEW_QUERIES, {});
                    break;
            }
        }
    }
}

export { Workers }
