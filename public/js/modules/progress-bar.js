import { Log } from './logger.js'
import { Utils } from './utils.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'

const TAG = "progress-bar"

class ProgressBar {
    constructor() {
        this.progressBar = document.getElementById('progress-bar');
        this.box = this.progressBar.querySelector('.box');
        this.time = this.progressBar.querySelector('.time');

        PubSub.subscribe(Constants.START_PROGRESS, () => {
            this.time.innerHTML = '';
            this.elapsed = 0;
            this.timer = setInterval(() => {
                this.elapsed++;
                this.time.innerHTML = this.elapsed + ' s';
            }, 1000);
            this.progressBar.classList.add('is-active');
        });

        PubSub.subscribe(Constants.STOP_PROGRESS, () => {
            this.progressBar.classList.remove('is-active');
            clearInterval(this.timer);
        });

        PubSub.subscribe(Constants.UPDATE_PROGRESS, (data) => {
            this.box.innerHTML = data.message;
        });
    }
}

let progressBar = new ProgressBar()
export default progressBar
