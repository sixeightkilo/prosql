import { Logger } from './../logger.js'
import { Constants } from './../constants.js'
import { PubSub } from './../pubsub.js'
import { Utils } from './../utils.js'
import { DbUtils } from './../dbutils.js'

const TAG = "db-deleter"

class Deleter {
    constructor(sessionId) {
        this.sessionId = sessionId;

        this.$dialog = document.getElementById('db-deleter-dialog');
        this.$cancel = this.$dialog.querySelector('.cancel');
        this.$ok = this.$dialog.querySelector('.ok');
        this.$body = this.$dialog.querySelector('.modal-card-body');
        this.$body.innerHTML = "This operation will delete the database. Are you sure?";
        this.$title = this.$dialog.querySelector('.modal-card-title');

        this.$ok.addEventListener('click', async () => {
            this.$ok.setAttribute('disabled', 'disabled');
            this.$title.innerHTML = `Deleting ${this.db}..`;

            let query = `drop database \`${this.db}\``;
            Logger.Log(TAG, query);

            let dbUtils = new DbUtils();
            let res = await dbUtils.execute.apply(this, [query]);

            if (res.status == "ok") {
                PubSub.publish(Constants.QUERY_DISPATCHED, {
                    query: query,
                    tags: [Constants.USER]
                });

                let rows = res.data[0][1];
                Utils.showAlert(`Deleted database ${this.db}`, 2000);
                this.closeDialog();
                this.$ok.removeAttribute('disabled');

                PubSub.publish(Constants.DB_DELETED, {});
                return;
            }

            this.$title.innerHTML = this.title;
            this.$ok.removeAttribute('disabled');
        });

        this.$cancel.addEventListener('click', () => {
            //if no query in progress this will be ignored
            DbUtils.cancel(this.sessionId, this.cursorId);
            this.closeDialog();
        });
    }

    openDialog() {
        this.$dialog.classList.add('is-active');
    }

    closeDialog() {
        this.$dialog.classList.remove('is-active');
    }

    setSessionInfo(sessionId, db) {
        this.sessionId = sessionId;
        this.db = db;
    }

    init(db) {
        this.db = db;
        this.title = `Delete ${this.db}?`;
        this.$title.innerHTML = this.title;
        this.openDialog();
    }
}

export { Deleter }
