import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'

const TAG = "query-history"

class QueryHistory {
    constructor() {
        this.$root = document.getElementById('app-left-panel')
        this.$rootTemplate = document.getElementById('query-search-template').innerHTML
        this.$root.replaceChildren()
        let n = Utils.generateNode(this.$rootTemplate, {})
        this.$root.append(n)

        PubSub.subscribe(Constants.QUERY_DISPATCHED, (data) => {
            Log(TAG, JSON.stringify(data));
        });
    }
}

export { QueryHistory }
