import { Logger } from './logger.js'
import { PubSub } from './pubsub.js'
import { Constants } from './constants.js'

const TAG = "grid-resizer"
class GridResizerH {
    //resize two elements contained in grid horizontal direction
    constructor($grid, $e1, $resizer, $e2) {
        this.$grid = $grid;
        this.$grid.style.gridTemplateColumns = '2fr 1px 8fr';
        this.d1 = $e1.getBoundingClientRect().width;
        this.d2 = $e2.getBoundingClientRect().width;

        Logger.Log(TAG, `${this.d1} ${this.d2}`);

        $resizer.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.startx = e.clientX;
            Logger.Log(TAG, `mousedown: ${e.clientX}`);
            e.preventDefault();
        })

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) {
                return;
            }
            Logger.Log(TAG, `mousemove: ${e.clientX}`);
            let delta = e.clientX - this.startx;
            this.d1 += delta;
            this.d2 += -1 * delta;
            Logger.Log(TAG, `${delta} ${this.d1} ${this.d2}`);

            this.$grid.style.gridTemplateColumns = `${this.d1}px 1px ${this.d2}px`;
            this.startx = e.clientX;
            e.preventDefault();
        });

        document.addEventListener('mouseup', (e) => {
            this.isDragging = false;
            Logger.Log(TAG, `mouseup: ${e.clientX}`);
            e.preventDefault();
            PubSub.publish(Constants.GRID_H_RESIZED, {
                d1: this.d1,
                d2: this.d2,
            });
        })
    }

    set(dims) {
        this.d1 = dims.d1;
        this.d2 = dims.d2;
        this.$grid.style.gridTemplateColumns = `${this.d1}px 1px ${this.d2}px`;
    }
}

export { GridResizerH }
