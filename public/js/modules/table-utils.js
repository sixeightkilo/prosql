//import { defineCustomElements } from '/node_modules/@revolist/revogrid/dist/esm/loader.js'
//import { CellHandler } from './cell-handler.js'
import { Log } from './logger.js'
import { Constants } from './constants.js'
import { Utils } from './utils.js'
import { PubSub } from './pubsub.js'
import { AgGrid } from './ag-grid.js'
import { CellRenderer } from './cell-renderer.js'

const TAG = "table-utils"

class TableUtils {
    constructor($root) {
        //defineCustomElements();
        this.$root = $root;
        this.$loaderTemplate = document.getElementById('table-loader-template').innerHTML;
        this.init();
    }

    async init() {
		await AgGrid.init();
    }

    async showContents(stream, fkMap, editable = false) {
        let grid = this.$root.querySelector('#grid');
        //clear existing grid if any
        if (grid != null) {
            grid.remove();
        }

        this.showLoader();

        let n = Utils.generateNode('<div id="grid" class="ag-theme-alpine"></div>', {});
        this.$root.append(n);
        grid = this.$root.querySelector('#grid');

        let i = 0;
        let cellRenderer = new CellRenderer(fkMap);

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
                let cols = [];
                for (let j = 0; j < row.length; j += 2) {
                    cols.push({
                        field: row[j],
                        resizable: true,
                        editable: editable,
                        onCellValueChanged: (params) => {
                            TableUtils.handleCellValueChanged(fkMap, params);
                        },
                        cellRenderer: (params) => {
                            return cellRenderer.render(params)
                        }
                    })
                }

                let gridOptions = {
                    columnDefs: cols,
                    undoRedoCellEditing: true,
                };

                new agGrid.Grid(grid, gridOptions);
                this.api = gridOptions.api;
            }

            let item = {};
            for (let j = 0; j < row.length; j += 2) {
                item[row[j]] = row[j + 1];
            }

            this.api.applyTransactionAsync({ add: [item] });
            i++
        }

        this.hideLoader();

        if (i == 0) {
            let gridOptions = {};

            new agGrid.Grid(grid, gridOptions);
            this.api = gridOptions.api;
            this.api.showNoRowsOverlay();
        }
    }

    undo() {
        this.api.undoCellEditing();
    }

    static handleCellValueChanged(fkMap, params) {
        let k = fkMap['primary-key'];
        PubSub.publish(Constants.CELL_EDITED, {
            key: {
                'name': k,
                'value': params.data[k]
            },
            col: {
                'name': params.colDef.field,
                'value': params.newValue
            },
        });
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
