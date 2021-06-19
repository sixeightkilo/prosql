import { defineCustomElements } from '/node_modules/@revolist/revogrid/dist/esm/loader.js'
import { columnTemplate } from './column-template.js'
import { cellTemplate } from './cell-template.js'
import { Log } from './logger.js'

const TAG = "table-utils"

class TableUtils {
    constructor() {
        defineCustomElements();
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
                        prop: row[j],
                        name: row[j],
                        cellTemplate: (createElement, props) => {
                            return cellTemplate(createElement, props, fkMap);
                        },
                    });
                }
                i++;
            }

            let item = {};
            for (let j = 0; j < row.length; j += 2) {
                item[row[j]] = row[j + 1];
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
}

export { TableUtils }
