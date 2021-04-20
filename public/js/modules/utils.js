import { Err } from './error.js'

class Utils {
    constructor() {
        //new Utils() must be called after DOMContentLoaded
        this.init()
    }

    init() {
        this.$alert = document.getElementById('alert')
    }

    static saveToSession(key, val) {
        sessionStorage.setItem(key, val)
    }

    static getFromSession(key, val) {
        return sessionStorage.getItem(key)
    }

    //https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
    static generateNode(templ, data) {
        let re = new RegExp(/{(.*?)}/g);

        templ = templ.replace(re, function(match, p1) {
            if (data[p1] || data[p1] == 0 || data[p1] == '') {
                return data[p1];
            } else {
                return match;
            }
        });

        let template = document.createElement('template');
        template.innerHTML = templ.trim()
        return template.content.firstChild;
    }

    static async fetch(url) {
        try {
            let response = await fetch(url)
            let json = await response.json()
            if (json.status == 'error') {
                throw json
            }

            return json
        } catch (e) {
            console.log(e)
            if (e['msg'] == Err.ERR_INVALID_SESSION_ID) {
                //user must login
                window.location = '/';
                return
            }

            if (e['msg'] == Err.ERR_INVALID_CURSOR_ID) {
                //let caller handle this
                return {
                    'status' : 'error',
                    'msg': e['msg'],
                    'data': null,
                }
            }

            if (e.msg) {
                //normal error. Display to user
                alert(e.msg)
                return e
            }

            //something terrible happened
            alert("Unrecoverable error. Most likely prosql agent is dead or not installed:-(")
            return {
                'status' : 'error',
                'msg': e,
                'data': null,
            }
        }
    }

    static async setOptions($ctx, values, def) {
        $ctx.replaceChildren()

        let $ot = document.getElementById('option-template')
        let ot = $ot.innerHTML

        values.forEach((v) => {
            let h = Utils.generateNode(ot, {value: v[1]})
            $ctx.append(h)
        })

        $ctx.value = def
    }

    showAlert(msg, t) {
        this.$alert.innerHTML = msg;
        this.$alert.style.visibility = 'visible';
        setTimeout(() => {
            this.$alert.style.visibility = 'hidden';
        }, t)
    }

    static showNoData() {
        console.log("No data")
    }

    static showResults(rows) {
        let $h = document.getElementById('results-header-tr')
        let $b = document.getElementById('results-body')

        $h.replaceChildren()
        $b.replaceChildren()

        let $ht = document.getElementById('results-header-col-template')
        let ht = $ht.innerHTML

        let $bt = document.getElementById('results-body-col-template')
        let bt = $bt.innerHTML

        for (let i = 0; i < rows.length; i++) {
            if (i == 0) {
                //create column headers
                for (let j = 0; j < rows[0].length; j += 2) {
                    let h = Utils.generateNode(ht, {
                        heading: rows[0][j]
                    })
                    $h.appendChild(h)
                }
            }

            //append a new row
            let $tr = Utils.generateNode('<tr></tr>', {})
            $b.appendChild($tr)

            let $row = $b.lastChild

            for (let j = 1; j < rows[i].length; j += 2) {
                let h = Utils.generateNode(bt, {
                    value: rows[i][j]
                })
                $row.appendChild(h)
            }
        }
    }
}
export { Utils }
