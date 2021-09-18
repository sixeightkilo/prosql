import { Log } from './logger.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'
import { DbUtils } from './dbutils.js'

const TAG = "pager"
class Pager {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.$next = document.getElementById('next')
            this.$prev = document.getElementById('prev')

            this.$next.addEventListener('click', async (e) => {
                this.handleCmd(Constants.CMD_NEXT_ROWS);
            })

            this.$prev.addEventListener('click', async (e) => {
                this.handleCmd(Constants.CMD_PREV_ROWS);
            })
        });

        [
            Constants.CMD_NEXT_ROWS,
            Constants.CMD_PREV_ROWS,
        ].forEach((c) => {
            ((c) => {
                PubSub.subscribe(c, () => {
                    this.handleCmd(c);
                });
            })(c)
        });
    }

    reset() {
        this.page = 0;
        this.$prev.classList.add('pager-disable');
        this.sortColumn = '';
        this.sortOrder = '';
        this.query = '';
    }

    setQuery(query) {
        this.query = query;
    }

    setSortInfo(col, order) {
        this.sortColumn = col;
        this.sortOrder = order;
    }

    init(query, renderFunc, sortColumn = null, sortOrder = null) {
        this.page = 0;
        this.query = query;
        this.sortColumn = sortColumn;
        this.sortOrder = sortOrder;
        this.renderFunc = renderFunc;

        this.$prev.classList.add('pager-disable');
        query = 
            `${this.query} ${DbUtils.getOrder(this.sortColumn, this.sortOrder)} limit ${DbUtils.getLimit(this.page, 0)}`;
        this.renderFunc(query);
    }

    async handleCmd(cmd) {
        switch (cmd) {
            case Constants.CMD_NEXT_ROWS:
                this.handleNextRows();
                break;

            case Constants.CMD_PREV_ROWS:
                this.handlePrevNows();
                break;
        }
    }

    async handleNextRows() {
        if (this.inFlight) {
            return;
        }

        this.inFlight = true;

        let query = 
            `${this.query} ${DbUtils.getOrder(this.sortColumn, this.sortOrder)} limit ${DbUtils.getLimit(this.page, 1)}`;

        let res = await this.renderFunc(query);
        if (res.status == "ok") {
            this.$prev.classList.remove('pager-disable');
            this.page++;
        }

        this.inFlight = false;
    }

    async handlePrevNows() {
        if (this.inFlight) {
            return;
        }

        this.inFlight = true;

        if (this.page == 0) {
            this.inFlight = false;
            return;
        }

        let query = 
            `${this.query} ${DbUtils.getOrder(this.sortColumn, this.sortOrder)} limit ${DbUtils.getLimit(this.page, -1)}`;

        let res = await this.renderFunc(query);
        if (res.status == "ok") {
            this.page--;
            if (this.page == 0) {
                this.$prev.classList.add('pager-disable');
            }
        }

        this.inFlight = false;
    }
}

let pager = new Pager()
export default pager
