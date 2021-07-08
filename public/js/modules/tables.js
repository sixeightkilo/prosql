import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'
import { Constants } from './constants.js'
import { Stream } from './stream.js'
import { PubSub } from './pubsub.js'

const TAG = "tables"
const USE_WS = false

class Tables {
    constructor(sessionId) {
        this.sessionId = sessionId
        this.$tables = document.getElementById('tables')
        this.$tableFilter = document.getElementById('table-filter')
        this.$tableFilter.addEventListener('keyup', () => {
            this.filter()
        })

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
        if (USE_WS) {
            return this.show_ws(db)
        }

        this.show_ajax(db)
    }

    async show_ajax(db) {
        let tables = await DbUtils.fetchAll(this.sessionId, `show tables from \`${db}\``)
        this.tables = []

        //save the table list in a more convenient form
        tables.forEach((t) => {
            this.tables.push(t[1])
        })
        this.render(this.tables)
    }

    async show_ws(db) {
        Log(TAG, "show_ws")
        let params = {
            'session-id': this.sessionId,
            query: `show tables from \`${db}\``
        }

        let stream = new Stream(Constants.WS_URL + '/query_ws?' + new URLSearchParams(params))

        this.$tables.replaceChildren()
        let $t = document.getElementById('table-template')
        let t = $t.innerHTML

        while (true) {
            let row = await stream.get();

            if (row.length == 1 && row[0] == "eos") {
                break;
            }

            let h = Utils.generateNode(t, {table: row[1]})
            this.$tables.append(h)
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
