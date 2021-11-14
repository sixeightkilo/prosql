import { Logger } from './logger.js'
import { Utils } from './utils.js'
const TAG = 'cell-editor';

class CellEditor {
   init(params) {
        let id = params.colDef.colId;
        let c = params.colDef.field;
        this.value = params.data[`${c}-${id}`];

       this.input = document.createElement('input');
       this.input.classList.add('input');
       this.input.id = 'input';
       this.input.value = this.value;

       this.input.addEventListener('input', (event) => {
           this.value = event.target.value;
           Logger.Log(TAG, "listener:" + this.value);
       });
   }

   /* Component Editor Lifecycle methods */
   // gets called once when grid ready to insert the element
   getGui() {
       return this.input;
   }

   // the final value to send to the grid, on completion of editing
   getValue() {
       // this simple editor doubles any value entered into the input
       Logger.Log(TAG, "getvalue:" + this.value);
       return this.input.value;
   }

   // Gets called once before editing starts, to give editor a chance to
   // cancel the editing before it even starts.
   isCancelBeforeStart() {
       return false;
   }

   // Gets called once when editing is finished (eg if Enter is pressed).
   // If you return true, then the result of the edit will be ignored.
   isCancelAfterEnd() {
       // our editor will reject any value greater than 1000
       return false;
   }

   // after this component has been created and inserted into the grid
   afterGuiAttached() {
       this.input.focus();
   }
}

export { CellEditor }
