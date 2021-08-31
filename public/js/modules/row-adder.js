import { Log } from './logger.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'
import { Utils } from './utils.js'

const TAG = "row-adder"

class RowAdder {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
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
                Log(TAG, this.columns);
                this.$dialog.classList.add('is-active');
                this.columns.forEach((c) => {
                    let n = Utils.generateNode(this.templ, {
                        col: c
                    });
                    this.$body.append(n);
                });
            });

            this.$ok.addEventListener('click', () => {
                this.$dialog.classList.remove('is-active');
            });

            this.$cancel.addEventListener('click', () => {
                this.$dialog.classList.remove('is-active');
            });
        })
    }

    init(table, columns) {
        this.table = table;
        this.columns = columns;
    }
}

let rowAdder = new RowAdder()
export default rowAdder
