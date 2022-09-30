import { Logger } from './logger.js'

const TAG = "grid-resizer"
class GridResizer {
    //resize two elements contained in grid in the specified direction
    constructor($grid, $e1, $resizer, $e2, direction = 'horizontal') {
        if (direction == 'horizontal') {
            this.d1 = $e1.getBoundingClientRect().width;
            this.d2 = $e2.getBoundingClientRect().width;
        } else {
            this.d1 = $e1.getBoundingClientRect().height;
            this.d2 = $e2.getBoundingClientRect().height;
        }

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

            $grid.style.gridTemplateColumns = `${this.d1}px 2px ${this.d2}px`;
            this.startx = e.clientX;
            e.preventDefault();
        });

        document.addEventListener('mouseup', (e) => {
            this.isDragging = false;
            Logger.Log(TAG, `mouseup: ${e.clientX}`);
            e.preventDefault();
        })
    }
}

export { GridResizer }
