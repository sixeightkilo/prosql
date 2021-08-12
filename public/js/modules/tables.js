import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'
import { Constants } from './constants.js'
import { Stream } from './stream.js'
import { PubSub } from './pubsub.js'

const TAG = "tables"

class Tables {
    constructor(sessionId) {
        this.$root = document.getElementById('app-left-panel')
        this.sessionId = sessionId
        this.$tables = document.getElementById('tables')
        this.$tableFilter = document.getElementById('table-filter')
        this.$exportTable = document.getElementById('export-table')
        this.$tableFilter.addEventListener('keyup', () => {
            this.filter();
        });

        this.$exportTable.addEventListener('click', () => {
            if (!this.table) {
                alert('No table selected');
                return
            }

            let q = `select * from \`${this.table}\``;
            let dbUtils = new DbUtils();
            dbUtils.exportResults.apply(this, [q]);
        });

        this.$tables.addEventListener('click', async (e) => {
            let target = e.target;
            if (target.className != 'table-name') {
                return
            }

            //remove highlight on all element first
            let list = this.$tables.querySelectorAll('.highlight');
            list.forEach((e) => {
                e.classList.remove('highlight');
            });

            let parent = target.parentElement;
            parent.classList.add('highlight');

            this.table = target.innerHTML

            PubSub.publish(Constants.TABLE_SELECTED, {table: target.innerHTML});
        })

        //update highlighted table if table is changed from elsewhere
        PubSub.subscribe(Constants.TABLE_CHANGED, (data) => {
            //remove highlight on all element first
            let list = this.$tables.querySelectorAll('.highlight');
            list.forEach((e) => {
                e.classList.remove('highlight');
            });

            //highlight new table
            list = this.$tables.querySelectorAll('.table-name');
            for (let i = 0; i < list.length; i++) {
                if (list[i].innerHTML == data.table) {
                    let parent = list[i].parentElement;
                    parent.classList.add('highlight');
                    break;
                }
            }
        });

        Log(TAG, `sessionId: ${sessionId}`)
    }

    setSessionInfo(sessionId, db) {
        this.sessionId = sessionId
        this.db = db
        Log(TAG, `sessionId: ${sessionId} db: ${db}`)
    }

    filter() {
        let f = this.$tableFilter.value

        if (f == '') {
            this.render(this.tables)
            return
        }

        Log(TAG, `Filtering ${f}`)

        let regex = new RegExp(`${f}`)
        let tables = this.tables.filter(t => regex.test(t))
        this.render(tables)
    }

    async show(db) {
        Log(TAG, "show")
        let q = `show tables from \`${db}\``
        let cursorId = await DbUtils.fetchCursorId(this.sessionId, q);

        let params = {
            'session-id': this.sessionId,
            'cursor-id': cursorId,
            'req-id': Utils.uuid(),
            'num-of-rows': -1 //get all table names
        }

        let stream = new Stream(Constants.WS_URL + '/fetch_ws?' + new URLSearchParams(params))

        this.$tables.replaceChildren()
        let $t = document.getElementById('table-template')
        let t = $t.innerHTML

        this.tables = []

        while (true) {
            let row = await stream.get();

            if (row.length == 1 && row[0] == "eos") {
                break;
            }

            let h = Utils.generateNode(t, {table: row[1]});
            this.$tables.append(h);
            this.tables.push(row[1]);
        }
    }

    render(tables) {
        this.$tables.replaceChildren()
        let $t = document.getElementById('table-template')
        let t = $t.innerHTML

        tables.forEach((tbl) => {
            let h = Utils.generateNode(t, {table: tbl})
            this.$tables.append(h)
        })
    }
}

export { Tables }
