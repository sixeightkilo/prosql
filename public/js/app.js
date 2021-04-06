import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'

class App {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.init()

            this.$submit.addEventListener('click', async () => {
                this.submit()
            })
        })
    }

    init() {
        this.$query = document.getElementById('query')
        this.$submit = document.getElementById('submit')
        this.sessionId = Utils.getFromSession(Constants.SESSION_ID)
        console.log(this.sessionId)
    }

    async submit() {
        let params = {
            'session-id': this.sessionId,
            query: encodeURIComponent(this.$query.value)
        }

        let response = await fetch(Constants.URL + '/check?' + new URLSearchParams(params))
        let json = await response.json()
        console.log(JSON.stringify(json))
        this.showResults(json)
    }

    showResults(json) {
        //show column headers
        let $ht = document.getElementById('results-header-col-template')
        let ht = $ht.innerHTML

        let $bt = document.getElementById('results-body-col-template')
        let bt = $bt.innerHTML

        let $h = document.getElementById('results-header-tr')
        let $b = document.getElementById('results-body')

        $h.replaceChildren()
        $b.replaceChildren()

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
