import { Logger } from './../logger.js'
import { Err } from './../error.js'
import { Utils } from './../utils.js'
import { Stream } from './../stream.js'
import { DbUtils } from './../dbutils.js'
import { Constants } from './../constants.js'
import { PubSub } from './../pubsub.js'
import { Renamer } from './renamer.js'
import { Deleter } from './deleter.js'

const TAG = "db-menu"

class DbMenu {
    constructor(sessionId, db) {
        Logger.Log(TAG, `sessionId: ${sessionId}`)

        this.sessionId = sessionId
        this.db = db;
        this.init()
    }

    //public method
    setSessionInfo(sessionId, db) {
        this.sessionId = sessionId
        this.db = db

        this.renamer.setSessionInfo(this.sessionId, this.db);
        this.deleter.setSessionInfo(this.sessionId, this.db);

        Logger.Log(TAG, `sessionId: ${sessionId} db: ${db}`)
    }

    init() {
        this.initDom();
        this.initHandlers();
        //this.initSubscribers();

        //dropdown handlers
        this.renamer = new Renamer(this.sessionId);
        this.deleter = new Deleter(this.sessionId);
    }

    initDom() {
        this.$dbMenu = document.getElementById('db-operations');
    }

    initHandlers() {
        this.$dbMenu.addEventListener('click', () => {
            if (!this.db) {
                alert("No database selected");
                return;
            }
            let $container = this.$dbMenu.parentNode.parentNode;	
            $container.classList.toggle('is-active');
        });

        let elementsArray = document.querySelectorAll('[class~="db-dropdown-item"]');

        elementsArray.forEach((elem) => {
            elem.addEventListener("click", (e) => {
                let $container = this.$dbMenu.parentNode.parentNode;	
                $container.classList.toggle('is-active');
                this.handleMenu(e.currentTarget.id)
            });
        });
    }

    handleMenu(id) {
        Logger.Log(TAG, `id: ${id}`);
		switch (id) {
        case 'rename-db':
            this.renamer.init(this.db);
            break;

        case 'delete-db':
            this.deleter.init(this.db);
            break;
        }
    }
}

export { DbMenu }
