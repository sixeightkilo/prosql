import { Logger } from './../logger.js'
import { Constants } from './../constants.js'
import { PubSub } from './../pubsub.js'
import { Utils } from './../utils.js'
import { DbUtils } from './../dbutils.js'

const TAG = "table-truncater"

class TableTruncater {
    constructor(sessionId) {
        this.sessionId = sessionId;

        this.$dialog = document.getElementById('table-truncater-dialog');
        this.$cancel = this.$dialog.querySelector('.cancel');
        this.$ok = this.$dialog.querySelector('.ok');
        this.$body = this.$dialog.querySelector('.modal-card-body');
        this.$body.innerHTML = "This operation will delete all rows from the table. Are you sure?";
        this.$title = this.$dialog.querySelector('.modal-card-title');

        this.$ok.addEventListener('click', async () => {
            this.$ok.setAttribute('disabled', 'disabled');
            this.$title.innerHTML = 'Truncating ..';

            let query = `truncate table \`${this.table}\``;
            Logger.Log(TAG, query);

            let dbUtils = new DbUtils();
            let res = await dbUtils.execute.apply(this, [query]);

            if (res.status == "ok") {
                PubSub.publish(Constants.QUERY_DISPATCHED, {
                    query: query,
                    tags: [Constants.USER]
                });

                let rows = res.data[0][1];
                Utils.showAlert(`Truncated table`, 2000);
                this.reset();
                this.closeDialog();
                this.$ok.removeAttribute('disabled');

                PubSub.publish(Constants.TABLE_RENAMED, {});
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

    setSessionId(sessionId) {
        this.sessionId = sessionId;
    }

    init(table) {
        this.table = table;
        this.title = `Truncate ${this.table}?`;
        this.$title.innerHTML = this.title;
        this.openDialog();
    }

    reset() {
    }
}

export { TableTruncater }
