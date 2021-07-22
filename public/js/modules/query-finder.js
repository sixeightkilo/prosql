import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'

const TAG = "query-finder"

class QueryFinder {
    constructor() {
        this.$root = document.getElementById('app-left-panel')
        this.$rootTemplate = document.getElementById('query-search-template').innerHTML
        this.$root.replaceChildren()
        let n = Utils.generateNode(this.$rootTemplate, {})
        this.$root.append(n)
    }
}

export { QueryFinder }
