import { Err } from './error.js'
import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { Utils } from './utils.js'
import { PubSub } from './pubsub.js'
import { AgGrid } from './ag-grid.js'
import { CellRenderer } from './cell-renderer.js'
import { CellHeader } from './cell-header.js'
import { CellEditor } from './cell-editor.js'

const TAG = "table-utils"

class TableUtils {
    constructor($root) {
        this.$root = $root;
        this.$loaderTemplate = document.getElementById('table-loader-template').innerHTML;
        this.init();

        document.addEventListener('click', (e) => {
            let p = e.target.parentElement;
            if (p.id != 'cancel-query') {
                return;
            }

            Logger.Log(TAG, "Cancel clicked");
            PubSub.publish(Constants.QUERY_CANCELLED, {});
        })
    }

    async init() {
		await AgGrid.init();
    }

    async showContents(stream, fkMap, selection = {}, editable = false, sortable = false) {
        this.fkMap = fkMap;
        let grid = this.createGrid();
        this.showLoader();

        let i = 0;
        let err = Err.ERR_NONE
        let s = Date.now();
        let e;

        while (true) {
            let row
            try {
                row = await stream.get();
            } catch (e) {
                PubSub.publish(Constants.STREAM_ERROR, {
                    'error': e
                });
                err = e
                break;
            }

            if (row.length == 1 && row[0] == "eos") {
                break;
            }

            if (i == 0) {
                //measure time to receive first row
                this.setupGrid(grid, row, fkMap, selection, editable, sortable);
            }

            let item = {};
            let k = 0;
            for (let j = 0; j < row.length; j += 2) {
                //We append an index to each column name. This makes is possible to 
                //display columns with same name. Refer cell renderer
                item[`${row[j]}-${k}`] = row[j + 1];
                k++;
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

        this.numOfRows = i

        if (err == Err.ERR_NONE) {
            let e = Date.now();
            return {
                'status': "ok",
                'rows-affected': this.numOfRows,
                'time-taken': (e - s)
            }
        }

        return {
            'status': "error",
            'msg': err
        }
    }

    createGrid() {
        //add grid div
        let grid = this.$root.querySelector('#grid');
        //clear existing grid if any
        if (grid != null) {
            grid.remove();
        }

        let n = Utils.generateNode('<div id="grid" class="ag-theme-alpine"></div>', {});
        this.$root.append(n);
        return this.$root.querySelector('#grid');
    }

    setupGrid(grid, row, fkMap, selection, editable, sortable) {
        let cols = this.setupColumns(row, fkMap, selection, editable);
        let gridOptions = {
            columnDefs: cols,
            undoRedoCellEditing: true,
            rowSelection: 'single',
            onSelectionChanged: () => {
                this.onSelectionChanged(fkMap);
            }
        };

        if (sortable) {
            gridOptions.components = {
                agColumnHeader: CellHeader,
            };
        }

        new agGrid.Grid(grid, gridOptions);
        this.gridOptions = gridOptions;
        this.api = gridOptions.api;
        this.api.hideOverlay();
    }

    onSelectionChanged(fkMap) {
        if (Utils.isEmpty(fkMap)) {
            return;
        }

        const selectedRows = this.gridOptions.api.getSelectedRows();
        Logger.Log(TAG, "fkMap:" + JSON.stringify(fkMap));
        Logger.Log(TAG, "onSelectionChanged:" + JSON.stringify(selectedRows));
        for (let k in selectedRows[0]) {
            if (k == fkMap['primary-key'] + '-' + fkMap['primary-key-id']) {
                PubSub.publish(Constants.ROW_SELECTED, {
                    'key': fkMap['primary-key'],
                    'value': selectedRows[0][k]
                });
                break;
            }
        }
    }

    setupColumns(row, fkMap, selection, editable ) {
        let cols = [];
        let cellRenderer = new CellRenderer(fkMap);
        //using colId makes it possible to display multiple columns with 
        //same name
        let k = 0;
        for (let j = 0; j < row.length; j += 2) {

            let show = selection[k] ?? true;
            if (row[j] == fkMap['primary-key']) {
                fkMap['primary-key-id'] = k;
            }
            cols.push({
                field: row[j],
                colId: k++,
                hide: !show,
                resizable: true,
                editable: editable,
                sortable: true,
                onCellValueChanged: (params) => {
                    this.handleCellValueChanged(fkMap, params);
                },
                cellRenderer: (params) => {
                    return cellRenderer.render(params)
                },
                cellEditor: CellEditor,
                valueGetter: params => {
                    Logger.Log(TAG, "valueGetter");
                    let id = params.colDef.colId;
                    let c = params.colDef.field;
                    return params.data[`${c}-${id}`];
                },
                valueSetter: params => {
                    Logger.Log(TAG, "valueSetter");
                    let id = params.colDef.colId;
                    let c = params.colDef.field;
                    params.data[`${c}-${id}`] = params.newValue;
                    return true;
                }
            })
        }

        return cols;
    }

    async update(stream) {
        let s = Date.now();
        //remove existing rows
        let rows = [];
        for (let i = 0; i < this.numOfRows; i++) {
            let n = this.api.rowModel.rowsToDisplay[i].data
            rows.push(n);
        }

        this.api.applyTransactionAsync({ remove: rows });

        //start adding new rows
        this.showLoader();

        let err = Err.ERR_NONE;
        let i = 0;

        while (true) {
            let row;
            try {
                row = await stream.get();
            } catch (e) {
                PubSub.publish(Constants.STREAM_ERROR, {
                    'error': e
                });
                err = e;
                break;
            }

            if (row.length == 1 && row[0] == "eos") {
                break;
            }

            let item = {};
            let k = 0;
            for (let j = 0; j < row.length; j += 2) {
                item[`${row[j]}-${k}`] = row[j + 1];
                k++;
            }

            this.api.applyTransactionAsync({ add: [item] });
            i++;
        }

        this.numOfRows = i;

        this.hideLoader();

        if (err == Err.ERR_NONE) {
            let e = Date.now();
            return {
                'status': "ok",
                'rows-affected': this.numOfRows,
                'time-taken': (e - s)
            }
        }

        return {
            'status': "error",
            'msg': err
        }
    }

    undo() {
        this.undoStarted = true;
        this.api.undoCellEditing();
    }

    selectColumns(selection) {
        for (let col in selection) {
            this.gridOptions.columnApi.setColumnVisible(col, selection[col]);
        }
    }

    handleCellValueChanged(fkMap, params) {
        if (this.undoStarted) {
            //handleCellValueChanged will be called even after undo.
            //At that time we don't want to trigger cell_edited event
            this.undoStarted = false;
            return;
        }
        Logger.Log(TAG, "handleCellValueChanged");
        let key = fkMap['primary-key'];

        let keyId = fkMap['primary-key-id'];
        let keyValue = params.data[`${key}-${keyId}`];

        let colId = params.colDef.colId;
        let colField = params.colDef.field;
        let colValue = params.data[`${colField}-${colId}`];

        PubSub.publish(Constants.CELL_EDITED, {
            key: {
                'name': key,
                'value': keyValue,
            },
            col: {
                'name': colField,
                'value': colValue
            },
            cell: {
                rowIndex: params.node.rowIndex,
                colId: params.colDef.colId
            }
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
        let spinner = loader.querySelector('button');
        spinner.style.left = (dims.width / 2) + 'px';
        spinner.style.top = (dims.height / 4) + 'px';
    }

    hideLoader() {
        let loader = document.querySelector('.table-loader');
        loader.remove();
    }

    clearInfo() {
        this.$timeTaken.innerText = '';
        this.$rowsAffected.innerText = '';
    }

    showInfo(t, n) {
        let rows = (n == 1) ? 'row' : 'rows';
        this.$timeTaken.innerText = `${t} ms`;
        this.$rowsAffected.innerText = `${n} ${rows} affected`;
    }
}

export { TableUtils }
