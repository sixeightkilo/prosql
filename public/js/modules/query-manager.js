import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'
import { Constants } from './constants.js'

const TAG = "query-manager"

class QueryManager {
    constructor(sessionId) {
        this.sessionId = sessionId
        Log(TAG, `sessionId: ${sessionId}`)
        this.init()
    }

    setSessionInfo(sessionId, db) {
        this.sessionId = sessionId
        this.db = db
        Log(TAG, `sessionId: ${sessionId} db: ${db}`)
    }

    async init() {
        this.$root = document.getElementById('app-right-panel')
        this.$rootTemplate = document.getElementById('query-container-template').innerHTML
    }

    async enable() {
        if (this.isEnabled) {
            return
        }

        this.$root.style.gridTemplateRows = "auto"
        this.$root.replaceChildren()
        let n = Utils.generateNode(this.$rootTemplate, {})
        this.$root.append(n)
        this.isEnabled = true
    }

    async disable() {
        this.isEnabled = false
    }
}

export { QueryManager }
