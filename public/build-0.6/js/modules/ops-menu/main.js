import { Logger } from './../logger.js'
import { Err } from './../error.js'
import { Utils } from './../utils.js'
import { Stream } from './../stream.js'
import { DbUtils } from './../dbutils.js'
import { Constants } from './../constants.js'
import { PubSub } from './../pubsub.js'
import { Hotkeys } from './../hotkeys.js'
import { TableRenamer } from './table-renamer.js'

const TAG = "ops-menu"

class OpsMenu {
    constructor(sessionId) {
        Logger.Log(TAG, `sessionId: ${sessionId}`)

        this.table = null;
        this.sessionId = sessionId
        this.init()
    }

    //public method
    setSessionInfo(sessionId, db) {
        this.sessionId = sessionId
        this.db = db
        Logger.Log(TAG, `sessionId: ${sessionId} db: ${db}`)
    }

    init() {
        this.initDom();
        this.initHandlers();
        this.initSubscribers();

        //dropdown handlers
        this.renamer = new TableRenamer(this.sessionId);
    }

    initDom() {
        this.$opsMenu = document.getElementById('table-operations');
        this.$renameTable = document.getElementById('rename-table');
    }

    initHandlers() {
        this.$opsMenu.addEventListener('click', () => {
            if (this.table == null) {
                alert('No table selected');
                return;
            }
            let $container = this.$opsMenu.parentNode.parentNode;	
            $container.classList.toggle('is-active');
        });

        this.$renameTable.addEventListener('click', () => {
            let $container = this.$opsMenu.parentNode.parentNode;	
            $container.classList.toggle('is-active');
            this.renameTable();
        });
    }

    renameTable() {
        this.renamer.init(this.table);
    }

    initSubscribers() {
        PubSub.subscribe(Constants.TABLE_SELECTED, (data) => {
            this.table = data.table;
        });
    }
}

export { OpsMenu }
