import { Log } from './logger.js'
import { PubSub } from './pubsub.js'
import { Constants } from './constants.js'
import { Utils } from './utils.js'

const TAG = "cell-header"

class CellHeader {
    init(params) {
        this.params = params;

        let templ = document.getElementById('table-header-template').innerHTML;
        this.$header = Utils.generateNode(templ, {
            'col': this.params.displayName
        });

        this.$sortDown = this.$header.querySelector('.customSortDownLabel');
        this.$sortUp = this.$header.querySelector('.customSortUpLabel');
        this.$sortRemove = this.$header.querySelector('.customSortRemoveLabel');

        if (this.params.enableSorting) {
            this.onSortAscRequestedListener = this.onSortRequested.bind(this, 'asc');
            this.$sortDown.addEventListener(
                'click',
                this.onSortAscRequestedListener
            );

            this.onSortDescRequestedListener = this.onSortRequested.bind(this, 'desc');
            this.$sortUp.addEventListener(
                'click',
                this.onSortDescRequestedListener
            );

            this.onRemoveSortListener = this.onSortRequested.bind(this, '');
            this.$sortRemove.addEventListener(
                'click',
                this.onRemoveSortListener
            );

            this.params.column.addEventListener(
                'sortChanged',
                this.onSortChangedListener
            );
        } else {
            this.$header.removeChild(this.$sortDown);
            this.$header.removeChild(this.$sortUp);
            this.$header.removeChild(this.$sortRemove);
        }

    }

    getGui() {
        return this.$header;
    }

    onSortRequested(order, event) {
        Log(TAG, `onSortRequested: col: ${this.params.column.colId} order: ${order}`);
        PubSub.publish(Constants.SORT_REQUESTED, {
            column: this.params.column.colId,
            order: order
        });

        //un-highlight other icons and highlight this
        let active = document.querySelectorAll('.sort-active');

        active.forEach((e) => {
            e.classList.remove('sort-active');
        });

        switch (order) {
        case 'asc':
            this.$sortDown.classList.add('sort-active');
            break;

        case 'desc':
            this.$sortUp.classList.add('sort-active');
            break;

        case '':
            return;
        }

        this.$sortRemove.classList.add('sort-active');
    }

    destroy() {
        this.$sortDown.removeEventListener(
            'click',
            this.onSortRequestedListener
        );

        this.eSortUpButton.removeEventListener(
            'click',
            this.onSortRequestedListener
        );

        this.$sortRemove.removeEventListener(
            'click',
            this.onSortRequestedListener
        );

        this.params.column.removeEventListener(
            'sortChanged',
            this.onSortChangedListener
        );
    }
}

export { CellHeader }
