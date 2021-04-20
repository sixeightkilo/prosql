import { Err } from './modules/error.js'
import { Utils } from './modules/utils.js'
import { DbUtils } from './modules/dbutils.js'
import { Constants } from './modules/constants.js'

class App {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.init()

            //this.$submit.addEventListener('click', async () => {
                //this.submit()
            //})

            //this.$next.addEventListener('click', async () => {
                //this.next()
            //})
        })
    }

    async init() {
        this.$query = document.getElementById('query')
        this.$databases = document.getElementById('databases')

        this.sessionId = Utils.getFromSession(Constants.SESSION_ID)
        console.log(this.sessionId)

        this.showDatabases()
    }

    async showDatabases() {
        let dbs = await DbUtils.getDatabases(this.sessionId)

        let $ot = document.getElementById('option-template')
        let ot = $ot.innerHTML
        let $dbselect = document.getElementById('databases')

        dbs.forEach((db) => {
            let h = Utils.generateNode(ot, {value: db[1]})
            $dbselect.append(h)
        })
    }

    async submit() {
        let params = {
            'session-id': this.sessionId,
            query: encodeURIComponent(this.$query.value)
        }

        let json = await Utils.fetch(Constants.URL + '/execute?' + new URLSearchParams(params))
        this.cursorId = json.data

        params = {
            'session-id': this.sessionId,
            'cursor-id': json.data,
            'num-of-rows': 100
        }

        json = await Utils.fetch(Constants.URL + '/fetch?' + new URLSearchParams(params))
        console.log(JSON.stringify(json))

        if (json.eof) {
            this.$next.disabled = true
        } else {
            this.$next.disabled = false
        }

        this.showResults(json)
    }

    async next() {
        let params = {
            'session-id': this.sessionId,
            'cursor-id': this.cursorId,
            'num-of-rows': 100
        }

        let json = await Utils.fetch(Constants.URL + '/fetch?' + new URLSearchParams(params))
        if (json.status == 'error') {
            if (json['msg'] == Err.ERR_INVALID_CURSOR_ID) {
                //quietly call submit
                this.submit()
                return
            }
        }
        if (json.eof) {
            this.$next.disabled = true
        }

        this.showResults(json)
    }

    showNoData() {
        console.log("No data")
    }

    showResults(json) {
        let $h = document.getElementById('results-header-tr')
        let $b = document.getElementById('results-body')

        $h.replaceChildren()
        $b.replaceChildren()

        if (json.data == null) {
            this.showNoData()
            return
        }

        if (json.data.length == 0) {
            this.showNoData()
            return
        }

        let $ht = document.getElementById('results-header-col-template')
        let ht = $ht.innerHTML

        let $bt = document.getElementById('results-body-col-template')
        let bt = $bt.innerHTML


        for (let i = 0; i < json.data.length; i++) {
            if (i == 0) {
                //create column headers
                for (let j = 0; j < json.data[0].length; j += 2) {
                    let h = Utils.generateNode(ht, {
                        heading: json.data[0][j]
                    })
                    $h.appendChild(h)
                }
            }

            //append a new row
            let $tr = Utils.generateNode('<tr></tr>', {})
            $b.appendChild($tr)

            let $row = $b.lastChild

            for (let j = 1; j < json.data[i].length; j += 2) {
                let h = Utils.generateNode(bt, {
                    value: json.data[i][j]
                })
                $row.appendChild(h)
            }
        }
    }
}

new App()
