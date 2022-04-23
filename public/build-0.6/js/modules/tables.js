import { Logger } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { DbUtils } from './dbutils.js'
import { Constants } from './constants.js'
import { Stream } from './stream.js'
import { PubSub } from './pubsub.js'
import { Hotkeys } from './hotkeys.js'

const TAG = "modules-tables"
const SCROLL_OFFSET = -50;
const DEBOUNCE_DELAY = 500;

//for saving state to local storage
const MODULES_TABLES_FILTER_TEXT = "modules-tables-filter-text";

class Tables {
    constructor(sessionId) {
        this.sessionId = sessionId

        this.initDom();
        this.initHandlers();
        this.initSubscribers();
        
        this.$tableFilter.focus();
        this.setFocusState(true, false, false);
        this.observed = null;
    }

    restoreState() {
        let v = Utils.getFromSession(MODULES_TABLES_FILTER_TEXT);
        if (v) {
            this.$tableFilter.value = v;
            this.$tableFilter.dispatchEvent(new KeyboardEvent('keyup'));
        }
    }

    initDom() {
        this.$root = document.getElementById('app-left-panel')
        this.$tables = document.getElementById('tables')
        this.$tableFilter = document.getElementById('field1')
        this.$exportTable = document.getElementById('export-table')
    }

    initHandlers() {
        this.$tableFilter.addEventListener('keyup', (e) => {
            if (e.which == Constants.UP_ARROW || e.which == Constants.DOWN_ARROW) {
                //these are used for list navigation. Not required for filtering
                return;
            }

            this.filter();
            let v = this.$tableFilter.value;
            if (v != '') {
                Utils.saveToSession(MODULES_TABLES_FILTER_TEXT, v);
                return;
            }
            Utils.removeFromSession(MODULES_TABLES_FILTER_TEXT);
        });

        this.$tableFilter.addEventListener('focus', (e) => {
            this.setFocusState(false, false, false);
        });

        this.$exportTable.addEventListener('click', () => {
            this.handleCmd(Constants.CMD_EXPORT_TABLE);
        });

        document.addEventListener('keydown', (e) => {
            let table = this.handleListNavigation(e);    
            this.debounce(table);
        });

        this.$tables.addEventListener('click', async (e) => {
            this.handleTableClick(e);
        })

        //from the tables list if a table is selected which is not is view (due to scroll) 
        //then observer helps to get that table into view by changing scroll position
        this.observer = new IntersectionObserver((entries, opts) => {
            entries.forEach(entry =>  
                this.$tables.scrollTop = entry.target.offsetTop + SCROLL_OFFSET
            )
        }, {
            root: this.$tables,
            threshold: 0.5
        });
    }

    initSubscribers() {
        //update highlighted table if table is changed from elsewhere
        PubSub.subscribe(Constants.TABLE_CHANGED, (data) => {
            let toObserve = this.handleTableChange(data.table);
            if (this.observed) {
                this.observer.unobserve(this.observed);
            }

            this.observer.observe(toObserve);
            this.observed = toObserve;
        });

        PubSub.subscribe(Constants.TABLE_RENAMED, () => {
            this.show();
        });

        PubSub.subscribe(Constants.GRID_HAS_FOCUS, (data) => {
            this.setFocusState(false, false, true);
        });

        PubSub.subscribe(Constants.SEARCH_BAR_HAS_FOCUS, (data) => {
            this.setFocusState(false, true, false);
        });

        //handle all keyboard shortcuts
        [
            Constants.CMD_EXPORT_TABLE,
        ].forEach((c) => {
            ((c) => {
                PubSub.subscribe(c, () => {
                    this.handleCmd(c);
                });
            })(c)
        });
    }

    debounce(table) {
        //when user is rapidly scrolling the tables list we don't want to keep loading 
        //new tables. Wait until user stops for a while
        ((table) => {
            setTimeout(() => {
                let n = this.getCurrentSelected();
                if (n == null) {
                    return;
                }

                if (this.filtered[n] == table) {
                    PubSub.publish(Constants.TABLE_SELECTED, {table: table});
                }
            }, DEBOUNCE_DELAY);
        })(table);
    }

    handleListNavigation(e) {
        if (this.gridHasFocus || this.searchBarHasFocus) {
            //no-op
            return;
        }

        if (e.which == Constants.DOWN_ARROW) {
            Logger.Log(TAG, "DOWN_ARROW");
            let table = this.getNext()
            this.setFocusState(true, false, false);
            this.handleTableChange(table);
            return table;
        }

        if (!this.listHasFocus) {
            //don't want to process update when list does not have focus 
            return;
        }

        if (e.which == Constants.UP_ARROW) {
            Logger.Log(TAG, "UP_ARROW");
            if (this.getCurrentSelected() == null) {
                //if no table is currently selected select the last one
                let table = this.getLast()
                this.handleTableChange(table);
                return table;
            }

            let p = this.getPrevious();
            if (p == null) {
                this.$tableFilter.focus();
                PubSub.publish(Constants.TABLE_UNSELECTED, {});
                this.filter();
                return null;
            }

            this.handleTableChange(p);
            return p;
        }
    }

    setFocusState(list = true, searchBar = false, grid = false) {
        if (list) {
            //when list has focus, we do NOT want to observe anything, mainly because
            //it does not work properly :-(. Let user manage the scroll position
            if (this.observed) {
                this.observer.unobserve(this.observed);
            }
        }
        this.listHasFocus = list;
        this.searchBarHasFocus = searchBar;;
        this.gridHasFocus = grid;;
    }

    getPrevious() {
        let selected = this.getCurrentSelected();
        Logger.Log(TAG, `getPrevious: selected: ${selected}`);
        if (selected == null) {
            return this.getLast();
        }

        let previous = selected - 1;
        if (previous < 0) {
            return null;
        }

        Logger.Log(TAG, `getPrevious: previous: ${previous}`);

        return this.filtered[previous];
    }

    getNext() {
        let selected = this.getCurrentSelected();
        Logger.Log(TAG, `getNext: selected: ${selected}`);
        if (selected == null) {
            return this.getFirst();
        }

        let next = selected + 1;
        if (next == this.filtered.length) {
            return this.getFirst();
        }

        Logger.Log(TAG, `getNext: next: ${next}`);

        return this.filtered[next];
    }

    getFirst() {
        return this.filtered[0] ?? '';
    }

    getLast() {
        return this.filtered[this.filtered.length - 1] ?? '';
    }

    getCurrentSelected() {
        if (!this.table) {
            return null;
        }

        for (let i = 0; i < this.filtered.length; i++) {
            if (this.table == this.filtered[i]) {
                return i;
            }
        }
    }

    handleTableClick(e) {
        let target = e.target;
        if (target.className != 'table-name') {
            return
        }

        this.setFocusState(true, false, false);
        //remove highlight on all element first
        let list = this.$tables.querySelectorAll('.highlight');
        list.forEach((e) => {
            e.classList.remove('highlight');
        });

        let parent = target.parentElement;
        parent.classList.add('highlight');

        this.table = target.innerHTML

        PubSub.publish(Constants.TABLE_SELECTED, {table: target.innerHTML});
    }

    handleTableChange(table) {
        //restore table list as per user's filter
        this.filter();
        //remove highlight on all element first
        let list = this.$tables.querySelectorAll('.highlight');
        for (let i = 0; i < list.length; i++) {
            if (list[i].classList.contains('highlight')) {
                list[i].classList.remove('highlight');
                //this.observer.unobserve(list[i]);
                break;
            }
        }

        this.table = table;
        //highlight new table if it exists in the list
        let found = null;
        list = this.$tables.querySelectorAll('.table-name');
        for (let i = 0; i < list.length; i++) {
            if (list[i].innerHTML == table) {
                let p = list[i].parentElement;
                p.classList.add('highlight');
                //this.observer.observe(p);

                found = p;
                break;
            }
        }

        if (found) {
            return found;
        }

        //if not present in the list, the user must be doing filtering. Override the 
        //filter and insert the table name in the displayed list
        Logger.Log(TAG, `found ${found}`);
        if (!found) {
            return this.addToList(table);
        }
    }

    addToList(table) {
        let $t = document.getElementById('table-template')
        let t = $t.innerHTML

        let h = Utils.generateNode(t, {
            table: table,
            highlight: 'highlight',
        })
        this.$tables.append(h)
        return this.$tables.querySelector('.highlight');
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
        this.table = null; //clear selection
        let f = this.$tableFilter.value

        if (f == '') {
            this.filtered = this.tables;
            this.render(this.tables)
            return
        }

        Logger.Log(TAG, `Filtering ${f}`)

        let regex = new RegExp(`${f}`)
        this.filtered = this.tables.filter(t => regex.test(t))
        this.render(this.filtered)
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

            this.tables.push(row[1]);
        }

        this.filtered = this.tables;
        this.render(this.tables);

        this.restoreState();
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
