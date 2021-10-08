import { Log } from './logger.js'
import { Utils } from './utils.js'
const TAG = 'cell-renderer';

class CellRenderer {
	constructor(fkMap) {
        this.fkMap = fkMap;
        this.fkCellTemplate = document.getElementById('fk-cell-template').innerHTML;
        this.cellTemplate = document.getElementById('cell-template').innerHTML;
    }

    render(params) {
        Log(TAG, `${params.colDef.field} ${params.value}`);
        let c = params.colDef.field;
        let v = params.data[c];

        let refTable = ''
        let refColumn = ''

        if (this.fkMap[c] && v != "NULL") {
            refTable = this.fkMap[c]['ref-table']
            refColumn = this.fkMap[c]['ref-column']
        }

        let cls = (v == "NULL") ? "null" : "";

        if (refTable) {
            return Utils.generateNode(this.fkCellTemplate, {
                'value': v,
                'table': refTable,
                'column': refColumn,
            });
        }

        return Utils.generateNode(this.cellTemplate, {
            'value': v,
            'cls': cls
        })
    }
}

export { CellRenderer }
