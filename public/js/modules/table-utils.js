import { defineCustomElements } from '/node_modules/@revolist/revogrid/dist/esm/loader.js'
import { columnTemplate } from './column-template.js'
import { cellTemplate } from './cell-template.js'
import { Log } from './logger.js'
import { Err } from './error.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'

const TAG = "table-utils"
const MIN_COL_WIDTH = 100//px
const BATCH_SIZE = 50

const createResizableColumn = function(col, resizer) {
		// Track the current position of mouse
		let x = 0;
		let w = 0;

		const mouseDownHandler = function(e) {
			// Get the current mouse position
			x = e.clientX;

			// Calculate the current width of column
			const styles = window.getComputedStyle(col);
			w = parseInt(styles.width, 10);

			// Attach listeners for document's events
			document.addEventListener('mousemove', mouseMoveHandler);
			document.addEventListener('mouseup', mouseUpHandler);
		};

		const mouseMoveHandler = function(e) {
			// Determine how far the mouse has been moved
			const dx = e.clientX - x;

			// Update the width of column
			col.style.width = `${w + dx}px`;
		};

		// When user releases the mouse, remove the existing event listeners
		const mouseUpHandler = function() {
			document.removeEventListener('mousemove', mouseMoveHandler);
			document.removeEventListener('mouseup', mouseUpHandler);
		};

		resizer.addEventListener('mousedown', mouseDownHandler);
};

class TableUtils {
    constructor() {
        defineCustomElements();
    }

    showHeaders($table, cols) {
        let $h = document.getElementById('results-header-tr')
        $h.replaceChildren()

        let $ht = document.getElementById('results-header-col-template')
        let ht = $ht.innerHTML

        //create column headers
        for (let j = 0; j < cols.length; j++) {
            let h = Utils.generateNode(ht, {
                heading: cols[j] 
            })
            $h.appendChild(h)
        }

        Log(TAG, `w: ${this.contentWidth}`)
        $table.style.width = MIN_COL_WIDTH * cols.length + 'px'
        let hdrs = $table.querySelectorAll('th')

        hdrs.forEach((h) => {
            h.style.width = `${MIN_COL_WIDTH}px`
            this.appendResizer($table, h)
        })
    }

    async showContents_batch(stream, fkMap, clear = true) {
        Log(TAG, 'showContents_batch');
        let s = new Date()

        let $b = document.getElementById('results-body')
        if (clear) {
            $b.replaceChildren()
        }

        let $bt = document.getElementById('results-body-col-template')
        let bt = $bt.innerHTML

        let $fragment = new DocumentFragment()
        let i = 0;

        while (true) {
            let row = await stream.get()

            if (row.length == 1 && row[0] == "eos") {
                break
            }

            TableUtils.appendRow($fragment, bt, row, fkMap)
            i++;
            if (i == BATCH_SIZE) {
                $b.append($fragment);
                i = 0;
                $fragment = new DocumentFragment()
            }
        }

        $b.append($fragment);

        let e = new Date()
        this.$footer.innerHTML = e.getTime() - s.getTime() + ' ms'
        Log(TAG, 'done showContents')
    }

    async showContents(stream, fkMap, clear = true) {
        let s = new Date()

        const grid = document.querySelector('revo-grid');

        let i = 0;
        let columns = [];
        let items = [];

        while (true) {
            let row = await stream.get();

            if (row.length == 1 && row[0] == "eos") {
                break;
            }

            if (i == 0) {
                for (let j = 0; j < row.length; j += 2) {
                    columns.push({
                        'prop': row[j],
                        'name': row[j],
                        'cellTemplate': cellTemplate,
                    });
                }
                i++;
            }

            let item = {};
            for (let j = 0; j < row.length; j += 2) {
                let c = row[j];//column name
                let v = row[j + 1];//column value
                let refTable = ''
                let refColumn = ''

                if (fkMap[c] && v != "NULL") {
                    refTable = fkMap[c]['ref-table']
                    refColumn = fkMap[c]['ref-column']
                }

                item[c] = {
                    v: v,
                    'ref-table': refTable,
                    'ref-column': refColumn
                };
            }

            items.push(item);
        }

        grid.resize = true;
		grid.columns = columns;
		grid.source = items;

        let e = new Date()
        this.$footer.innerHTML = e.getTime() - s.getTime() + ' ms'
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

    appendResizer($table, h) {
        // Create a resizer element
        const resizer = document.createElement('div');
        resizer.classList.add('resizer');

        // Set the height
        resizer.style.height = `${$table.offsetHeight}px`;

        // Add a resizer element to the column
        h.appendChild(resizer);

        // Will be implemented in the next section
        createResizableColumn(h, resizer);
    }
}

export { TableUtils }
