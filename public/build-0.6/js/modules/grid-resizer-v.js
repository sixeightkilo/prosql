import { Logger } from './logger.js'

const TAG = "grid-resizer"
class GridResizerV {
    //resize two elements contained in grid horizontal direction
    constructor($grid, $e1, $resizer, $e2) {
        this.d1 = $e1.getBoundingClientRect().height;
        this.d2 = $e2.getBoundingClientRect().height;

        Logger.Log(TAG, `${this.d1} ${this.d2}`);

        $resizer.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.starty = e.clientY;
            Logger.Log(TAG, `mousedown: ${e.clientY}`);
            e.preventDefault();
        })

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) {
                return;
            }
            Logger.Log(TAG, `mousemove: ${e.clientY}`);
            let delta = e.clientY - this.starty;
            this.d1 += delta;
            this.d2 += -1 * delta;
            Logger.Log(TAG, `${delta} ${this.d1} ${this.d2}`);

            $grid.style.gridTemplateRows = `${this.d1}px 2px ${this.d2}px`;
            this.starty = e.clientY;
            e.preventDefault();
        });

        document.addEventListener('mouseup', (e) => {
            this.isDragging = false;
            Logger.Log(TAG, `mouseup: ${e.clientY}`);
            e.preventDefault();
        })
    }
}

export { GridResizerV }
