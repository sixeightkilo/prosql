import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'

const TAG = "row-adder"

class RowAdder {
    constructor(sessionId) {
        this.sessionId = sessionId;

        this.$add = document.getElementById('add-row');
        this.$dialog = document.getElementById('row-adder-dialog');
        this.$cancel = this.$dialog.querySelector('.cancel');
        this.$ok = this.$dialog.querySelector('.ok');
        this.templ = this.$dialog.querySelector('#col-input-template').innerHTML;
        this.$body = this.$dialog.querySelector('.modal-card-body');
        this.$title = this.$dialog.querySelector('.modal-card-title');

        this.$add.addEventListener('click', () => {
            if (this.table == null || this.columns == null) {
                return;
            }

            this.$title.innerHTML = `Add new row to ${this.table}`;
            this.$body.replaceChildren();
            Logger.Log(TAG, this.columns);
            this.openDialog();
            this.columns.forEach((c) => {
                let n = Utils.generateNode(this.templ, {
                    col: c
                });
                this.$body.append(n);
            });
        });

        this.$ok.addEventListener('click', async () => {
            this.$ok.setAttribute('disabled', 'disabled');
            this.$title.innerHTML = 'Inserting row ..';

            let cols = []
            let vals = []
            let $inputs = this.$dialog.querySelectorAll('input');

            $inputs.forEach((e) => {
                let v = e.value;
                if (v) {
                    cols.push(e.dataset.col);
                    vals.push(v);
                }
            });

            if (vals.length == 0) {
                this.closeDialog();
                return;
            }

            Logger.Log(TAG, `cols: ${cols}`);
            Logger.Log(TAG, `vals: ${vals}`);
            cols = cols.map(e => `\`${e}\``).join(",");
            vals = vals.map(e => `'${e}'`).join(",");

            let query = `insert into \`${this.table}\` (${cols}) values (${vals})`;
            Logger.Log(TAG, query);

            let dbUtils = new DbUtils();
            let res = await dbUtils.execute.apply(this, [query]);

            if (res.status == "ok") {
                PubSub.publish(Constants.QUERY_DISPATCHED, {
                    query: query,
                    tags: [Constants.USER]
                });

                let rows = res.data[0][1];
                Utils.showAlert(`Inserted ${rows} ${rows == "1" ? "row" : "rows"}`, 2000);
                this.closeDialog();

                this.$ok.removeAttribute('disabled');
                return;
            }

            this.$title.innerHTML = `Add new row to ${this.table}`;
            this.$ok.removeAttribute('disabled');
        });

        this.$cancel.addEventListener('click', () => {
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

    init(table, columns) {
        this.table = table;
        this.columns = columns;
    }
}

export { RowAdder }
