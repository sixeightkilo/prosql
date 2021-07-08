import { defineCustomElements } from '/node_modules/@revolist/revogrid/dist/esm/loader.js'
import { CellHandler } from './cell-handler.js'
import { Log } from './logger.js'
import { Constants } from './constants.js'
import { Utils } from './utils.js'
import { PubSub } from './pubsub.js'

const TAG = "table-utils"

class TableUtils {
    constructor($root) {
        defineCustomElements();
        this.$root = $root;
    }

    async showContents(stream, fkMap, clear = true) {
        let grid = this.$root.querySelector('revo-grid');
        //clear existing grid if any
        if (grid != null) {
            grid.remove();
        }

        let n = Utils.generateNode('<revo-grid class=grid-component></revo-grid>', {});
        this.$root.append(n);
        grid = this.$root.querySelector('revo-grid');

        let i = 0;
        let columns = [];
        let items = [];

        let cellHandler = new CellHandler(grid, fkMap);

        while (true) {
            let row
            try {
                row = await stream.get();
            } catch (e) {
                PubSub.publish(Constants.STREAM_ERROR, {
                    'error': e
                });
                break;
            }

            if (row.length == 1 && row[0] == "eos") {
                break;
            }

            if (i == 0) {
                for (let j = 0; j < row.length; j += 2) {
                    columns.push({
                        prop: row[j],
                        name: row[j],
                        cellTemplate: (createElement, props) => {
                            return cellHandler.cellTemplate(createElement, props);
                        }
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
    }
}

export { TableUtils }
