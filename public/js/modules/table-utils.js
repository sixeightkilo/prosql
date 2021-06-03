import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'

const TAG = "table-utils"
class TableUtils {
    async showContents(stream, fkMap) {
        let s = new Date()

        let $b = document.getElementById('results-body')
        $b.replaceChildren()

        let $bt = document.getElementById('results-body-col-template')
        let bt = $bt.innerHTML

        let i = 0
        while (true) {
            let row = await stream.get()
            if (i == 0) {
                let e = new Date()
                this.$footer.innerHTML = e.getTime() - s.getTime() + ' ms'
                i++
            }

            if (row.length == 1 && row[0] == "eos") {
                break
            }

            TableUtils.appendRow($b, bt, row, fkMap)
        }

        Log(TAG, 'done showContents')
    }

    static appendRow($b, bt, row, fkMap) {
        let $tr = Utils.generateNode('<tr></tr>', {})
        $b.appendChild($tr)

        let $row = $b.lastChild

        for (let j = 1; j < row.length; j += 2) {
            let v = row[j]
            let c = row[j - 1] //this is column name
            let refTable = ''
            let refColumn = ''

            //get reftable and refColumn if any. Only for Non NULL values
            if (fkMap[c] && v != "NULL") {
                refTable = fkMap[c]['ref-table']
                refColumn = fkMap[c]['ref-column']
            }

            let h = Utils.generateNode(bt, {
                value: v,
                'ref-table': refTable,
                'ref-column': refColumn
            })

            $row.appendChild(h)

            if (v == "NULL") {
                $row.lastChild.classList.add('null')
            }

            //show link if required
            if (refTable) {
                let $col = $row.lastChild
                let $link = $col.querySelector('i')
                $link.style.display = 'block'
            }
        }
    }
}

export { TableUtils }
