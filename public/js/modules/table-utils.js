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
        this.$loaderTemplate = document.getElementById('table-loader-template').innerHTML;
    }

    async showContents(stream, fkMap, clear = true) {
        let grid = this.$root.querySelector('revo-grid');
        //clear existing grid if any
        if (grid != null) {
            grid.remove();
        }

        this.showLoader();

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

        this.hideLoader();

        if (items.length == 0) {
            columns = [
                {
                    'prop' : '0 Rows',
                    'name' : '0 Rows',
                }
            ];
        }

        grid.resize = true;
		grid.columns = columns;
		grid.source = items;
    }

    showLoader() {
        //todo:this is very hackish. Must be accomplished with CSS alone
        let n = Utils.generateNode(this.$loaderTemplate, {});
        document.querySelector('body').append(n);
        let loader = document.querySelector('.table-loader');
        let dims = this.$root.getBoundingClientRect()
        loader.style.width = dims.width + 'px';
        loader.style.height = dims.height + 'px';
        loader.style.left = dims.left + 'px';
        loader.style.top = dims.top + 'px';
        let spinner = loader.querySelector('i');
        spinner.style.left = (dims.width / 2) + 'px';
        spinner.style.top = (dims.height / 4) + 'px';
    }

    hideLoader() {
        let loader = document.querySelector('.table-loader');
        loader.remove();
    }
}

export { TableUtils }
