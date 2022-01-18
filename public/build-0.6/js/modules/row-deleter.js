import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'

const TAG = "row-deleter"

class RowDeleter {
    constructor(sessionId) {
        this.sessionId = sessionId;

        this.$del = document.getElementById('del-row');
        this.$dialog = document.getElementById('row-deleter-dialog');
        this.$cancel = this.$dialog.querySelector('.cancel');
        this.$ok = this.$dialog.querySelector('.ok');
        this.$body = this.$dialog.querySelector('.modal-card-body');
        this.$title = this.$dialog.querySelector('.modal-card-title');

        PubSub.subscribe(Constants.ROW_SELECTED, (data) => {
            this.handleRowSelected(data);
        });

        this.$del.addEventListener('click', () => {
            if (this.table == null) {
                return;
            }

            if (this.key == null) {
                return;
            }

            this.$title.innerHTML = `Confirm row delete`;
            this.$body.replaceChildren();
            this.$body.append(`Delete row with primary key ${this.value} ?`);
            this.openDialog();
        });

        this.$ok.addEventListener('click', async () => {
            let query = `delete from \`${this.table}\` where \`${this.key}\` = \'${this.value}\'`;
            Logger.Log(TAG, query);

            let dbUtils = new DbUtils();
            let res = await dbUtils.execute.apply(this, [query]);

            if (res.status == "ok") {
                PubSub.publish(Constants.QUERY_DISPATCHED, {
                    query: query,
                    tags: [Constants.USER]
                });

                let rows = res.data[0][1];
                Utils.showAlert(`Deleted ${rows} ${rows == "1" ? "row" : "rows"}`, 2000);
                this.reset();
                this.closeDialog();

                PubSub.publish(Constants.ROW_DELETED, {});
                return;
            }
        });

        this.$cancel.addEventListener('click', () => {
            this.closeDialog();
        });
    }

    handleRowSelected(data) {
        Logger.Log(TAG, JSON.stringify(data));
        this.$del.classList.remove('fa-disabled');
        this.key = data['key'];
        this.value = data['value'];
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
        this.reset();
    }

    reset() {
        this.key = null;
        this.value = null;
        this.$del.classList.add('fa-disabled');
    }
}

export { RowDeleter }
