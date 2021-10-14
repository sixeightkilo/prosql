import { Log } from './logger.js'
import { PubSub } from './pubsub.js'
import { Constants } from './constants.js'
import { Utils } from './utils.js'

const TAG = "cell-header"

class CellHeader {
    init(params) {
        this.params = params;
        //todo: Using generateNode causes lot of error in console
        this.$header = document.createElement('div');
        this.$header.innerHTML = `
           <div class="customHeaderLabel">${this.params.displayName}</div>
           <div class="customSortDownLabel inactive">
               <i class="fa fa-long-arrow-alt-down"></i>
           </div>
           <div class="customSortUpLabel inactive">
               <i class="fa fa-long-arrow-alt-up"></i>
           </div>
           <div class="customSortRemoveLabel inactive">
               <i class="fa fa-times"></i>
           </div>
       `;

        this.$sortDown = this.$header.querySelector(".customSortDownLabel");
        this.$sortUp = this.$header.querySelector(".customSortUpLabel");
        this.$sortRemove = this.$header.querySelector(".customSortRemoveLabel");

        if (this.params.enableSorting) {
            this.onSortAscRequestedListener = this.onSortRequested.bind(this, 'asc');
            this.$sortDown.addEventListener('click', this.onSortAscRequestedListener);
            this.onSortDescRequestedListener = this.onSortRequested.bind(this, 'desc');
            this.$sortUp.addEventListener('click', this.onSortDescRequestedListener);
            this.onRemoveSortListener = this.onSortRequested.bind(this, '');
            this.$sortRemove.addEventListener('click', this.onRemoveSortListener);

            this.onSortChangedListener = this.onSortChanged.bind(this);
            this.params.column.addEventListener('sortChanged', this.onSortChangedListener);
            this.onSortChanged();
        } else {
            this.$header.removeChild(this.$sortDown);
            this.$header.removeChild(this.$sortUp);
            this.$header.removeChild(this.$sortRemove);
        }
    }

    onSortChanged(order) {
        const deactivate = toDeactivateItems => {
            toDeactivateItems.forEach(toDeactivate => {
                toDeactivate.className = toDeactivate.className.split(' ')[0]
            });
        }

        const activate = toActivate => {
            toActivate.className = toActivate.className + " sort-active";
        }

        if (order == 'asc') {
            deactivate([this.$sortUp, this.$sortRemove]);
            activate(this.$sortDown)
        } else if (order == 'desc') {
            deactivate([this.$sortDown, this.$sortRemove]);
            activate(this.$sortUp)
        } else {
            deactivate([this.$sortUp, this.$sortDown]);
            activate(this.$sortRemove)
        }
    }

    getGui() {
        return this.$header;
    }

    onSortRequested(order, event) {
        PubSub.publish(Constants.SORT_REQUESTED, {
            column: this.params.column.colDef.field,
            order: order
        });

        //this.params.setSort(order, event.shiftKey);
        this.onSortChanged(order);
    }

    destroy() {
        this.$sortDown.removeEventListener('click', this.onSortRequestedListener);
        this.$sortUp.removeEventListener('click', this.onSortRequestedListener);
        this.$sortRemove.removeEventListener('click', this.onSortRequestedListener);
        this.params.column.removeEventListener('sortChanged', this.onSortChangedListener);
    } 
}

export { CellHeader }
