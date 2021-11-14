import { Logger } from './logger.js'
import { QueryRunner } from './query-runner.js'
import { QueryFinder } from './query-finder.js'
import { QueryHistory } from './query-history.js'

const TAG = "query-runner"
const USE_WS = true

class Queries {
    constructor(sessionId) {
        this.sessionId = sessionId
        Logger.Log(TAG, `sessionId: ${sessionId}`)
        this.queryRunner = new QueryRunner(this.sessionId)
        this.history = new QueryHistory();
    }

    setSessionInfo(sessionId, db) {
        this.sessionId = sessionId
        this.db = db
        Logger.Log(TAG, `sessionId: ${sessionId} db: ${db}`)
        this.queryRunner.setSessionInfo(sessionId, db);
    }

    enable() {
        if (this.isEnabled) {
            return
        }

        this.queryRunner.enable();
        this.finder = new QueryFinder();
    }

    disable() {
        if (this.isEnabled) {
            this.queryRunner.disable();
        }
    }
}

export { Queries }
