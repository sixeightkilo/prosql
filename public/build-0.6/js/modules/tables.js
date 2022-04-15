import { Logger } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'
import { Constants } from './constants.js'
import { Stream } from './stream.js'
import { PubSub } from './pubsub.js'
import { Hotkeys } from './hotkeys.js'

const TAG = "modules-tables"
const SCROLL_OFFSET = 200;

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
            this.handleCmd(Constants.CMD_EXPORT_TABLE);
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
            //restore table list as per user's filter
            this.filter();
            //remove highlight on all element first
            let list = this.$tables.querySelectorAll('.highlight');
            list.forEach((e) => {
                e.classList.remove('highlight');
            });

            //highlight new table if it exists in the list
            let found = false;
            list = this.$tables.querySelectorAll('.table-name');
            for (let i = 0; i < list.length; i++) {
                if (list[i].innerHTML == data.table) {
                    let parent = list[i].parentElement;
                    parent.classList.add('highlight');

                    //make this list item visible to user
                    this.$tables.scrollTop = list[i].offsetTop + SCROLL_OFFSET;
                    found = true;
                    break;
                }
            }

            //if not present in the list, the user must be doing filtering. Override the 
            //filter and insert the table name in the displayed list
            Logger.Log(TAG, `found ${found}`);
            if (!found) {
                this.addToList(data.table);
            }
        });

        PubSub.subscribe(Constants.TABLE_RENAMED, () => {
            this.show();
        });

        Logger.Log(TAG, `sessionId: ${sessionId}`);
        //handle all keyboard shortcuts
        [
            Constants.CMD_EXPORT_TABLE,
            Constants.CMD_SEARCH_TABLES
        ].forEach((c) => {
            ((c) => {
                PubSub.subscribe(c, () => {
                    this.handleCmd(c);
                });
            })(c)
        });
    }

    addToList(table) {
        let $t = document.getElementById('table-template')
        let t = $t.innerHTML

        let h = Utils.generateNode(t, {
            table: table,
            highlight: 'highlight',
        })
        this.$tables.append(h)
    }

    async handleCmd(cmd) {
        switch (cmd) {
        case Constants.CMD_EXPORT_TABLE:
            this.handleExportTable();
            break;

        case Constants.CMD_SEARCH_TABLES:
            this.$tableFilter.focus();
            break;
        }
    }

    async handleExportTable() {
        if (!this.table) {
            alert('No table selected');
            return
        }

        let q = `select * from \`${this.table}\``;
        let dbUtils = new DbUtils();
        dbUtils.exportResults.apply(this, [q]);
    }

    setSessionInfo(sessionId, db) {
        this.sessionId = sessionId
        this.db = db
        Logger.Log(TAG, `sessionId: ${sessionId} db: ${db}`)
    }

    filter() {
        let f = this.$tableFilter.value

        if (f == '') {
            this.render(this.tables)
            return
        }

        Logger.Log(TAG, `Filtering ${f}`)

        let regex = new RegExp(`${f}`)
        let tables = this.tables.filter(t => regex.test(t))
        this.render(tables)
    }

    async show(db = null) {
        Logger.Log(TAG, "show")
        db = db ?? this.db;
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
