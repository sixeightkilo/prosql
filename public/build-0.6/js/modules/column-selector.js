import { Log } from './logger.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'
import { Utils } from './utils.js'

const TAG = "col-selector"

class ColumnSelector {
    constructor() {
        let selections = Utils.getFromLocalStorage(Constants.COLUMN_SELECTIONS);
        if (selections) {
            this.selections = JSON.parse(selections);
        } else {
            this.selections = {};
        }

        this.$selCols = document.getElementById('select-cols');
        this.$dialog = document.getElementById('column-selector-dialog');
        this.$cancel = this.$dialog.querySelector('.cancel');
        this.$ok = this.$dialog.querySelector('.ok');
        this.templ = this.$dialog.querySelector('#col-select-template').innerHTML;
        this.$body = this.$dialog.querySelectorAll('.modal-card-body')[1];
        this.$title = this.$dialog.querySelector('.modal-card-title');
        this.$checkAll = this.$dialog.querySelector('.checkall');

        this.$selCols.addEventListener('click', () => {
            if (this.table == null || this.columns == null) {
                alert('No table selected');
                return;
            }

            this.$title.innerHTML = `Select columns from ${this.table} to display`;
            this.$body.replaceChildren();
            Log(TAG, this.columns);

            let selection = this.selections[this.table] ?? {};

            let allChecked = true;

            for (let i = 0; i < this.columns.length; i++) {
                let c = this.columns[i];
                let n = Utils.generateNode(this.templ, {
                    col: c
                });

                let checked = selection[i] ?? true;
                if (!checked) {
                    allChecked = false
                }
                n.querySelector('.checkbox').checked = checked;

                this.$body.append(n);
            }

            this.$checkAll.checked = allChecked;

            this.$dialog.classList.add('is-active');
        });

        this.$checkAll.addEventListener('change', () => {
            let $inputs = this.$body.querySelectorAll('input');
            if (this.$checkAll.checked) {
                $inputs.forEach((i) => {
                    i.checked = true;
                });

                return;
            }

            $inputs.forEach((i) => {
                i.checked = false;
            });
        });

        this.$ok.addEventListener('click', async () => {
            let selection = {};
            let $inputs = this.$body.querySelectorAll('input');
            //column ids are in sequence
            let id = 0
            $inputs.forEach((e) => {
                if (e.checked) {
                    selection[id] = true;
                } else {
                    selection[id] = false;
                }
                id++;
            });

            Log(TAG, JSON.stringify(selections));
            PubSub.publish(Constants.COLUMNS_SELECTED, {
                cols: selection
            });

            this.selections[this.table] = selection;
            Utils.saveToLocalStorage(Constants.COLUMN_SELECTIONS, JSON.stringify(this.selections));

            this.$dialog.classList.remove('is-active');
        });

        this.$cancel.addEventListener('click', () => {
            this.$dialog.classList.remove('is-active');
        });
    }

    init(table, columns) {
        this.table = table;
        this.columns = columns;
    }

    getSelection(table) {
        return this.selections[table] ?? {};
    }
}

export { ColumnSelector }
