import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { Monitor } from './modules/monitor.js'
import { Log } from './modules/logger.js'

const TAG = "install"
const MONITOR_INTERVAL = 5000;
const REDIRECT_DELAY = 2000;

class Install {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.$tabs = document.querySelector('.tabs');
            this.$contents = document.querySelectorAll('.tab-content');
            this.$card = document.querySelector('.card');
            this.$cardText = this.$card.querySelector('.card-header-title');
            this.$cardIcon = this.$card.querySelector('i');
            this.$instructions = document.querySelector('.instructions');
            this.init();
        });

        let timerId = setInterval(async () => {
            if (await Monitor.isAgentInstalled()) {
                this.updateCard();
                this.updateInstructions();
                clearInterval(timerId);
                setTimeout(() => {
                    window.location = '/login';
                }, REDIRECT_DELAY);
            }
        }, MONITOR_INTERVAL);
    }

    updateInstructions() {
        this.$instructions.classList.add('has-text-grey-lighter');
    }

    updateCard() {
        this.$card.classList.remove('has-background-light');
        this.$cardText.classList.remove('has-text-black-bis');
        this.$cardIcon.classList.remove('icon-wondering');

        this.$card.classList.add('has-background-success-dark');
        this.$cardText.classList.add('has-text-white-bis');
        this.$cardText.innerHTML = 'Prosql-agent working fine!';
        this.$cardIcon.classList.add('icon-smile');
        this.$cardIcon.classList.add('has-text-white-bis');
    }

    init() {
        let list = this.$tabs.querySelectorAll('li');
        list.forEach((t) => {
            t.addEventListener('click', (e) => {
                let li = e.target.parentElement;
                if (li.classList.contains('is-active')) {
                    return;
                }

                //disable currently active tab
                this.$tabs.querySelector('.is-active').classList.remove('is-active');
                this.$contents.forEach((e) => {
                    e.style.display = "none";
                });

                //activate current tab
                li.classList.add('is-active');

                //and the content
                let target = e.target;
                Log(TAG, target.className);
                this.$contents.forEach(($c) => {
                    if ($c.classList.contains(`${target.className}`)) {
                        $c.style.display = "block";
                    }
                });
            });
        });
    }
}

new Install()
