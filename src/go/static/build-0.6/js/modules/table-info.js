import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'

const TAG = "table-info"

class TableInfo {
    constructor(sessionId) {
        this.sessionId = sessionId;

        this.$info = document.getElementById('table-info');
        this.$dialog = document.getElementById('table-info-dialog');
        //this.$cancel = this.$dialog.querySelector('.cancel');
        this.$ok = this.$dialog.querySelector('.ok');
        this.$body = this.$dialog.querySelector('.modal-card-body');
        this.$title = this.$dialog.querySelector('.modal-card-title');

        this.$info.addEventListener('click', () => {
            if (this.table == null) {
                return;
            }

            this.$title.innerHTML = `${this.table}`;
            this.$body.replaceChildren();
            this.$body.innerHTML = this.createQuery;
            Logger.Log(TAG, this.columns);
            this.$dialog.classList.add('is-active');
        });

        this.$ok.addEventListener('click', async () => {
            this.$dialog.classList.remove('is-active');
        });

        //this.$cancel.addEventListener('click', () => {
            //this.$dialog.classList.remove('is-active');
        //});

        PubSub.subscribe(Constants.TABLE_CHANGED, (data) => {
            this.table = data.table;
            this.fetchQuery()
        });

        PubSub.subscribe(Constants.TABLE_SELECTED, (data) => {
            this.table = data.table;
            this.fetchQuery()
        });
    }

    async fetchQuery() {
        let res = await DbUtils.fetchAll(this.sessionId, `show create table \`${this.table}\``);
        Logger.Log(TAG, JSON.stringify(res));
        this.createQuery = `<pre> ${res[0][3]} </pre>`;
    }

    setSessionId(sessionId) {
        this.sessionId = sessionId;
    }
}

export { TableInfo }
