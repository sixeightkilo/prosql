import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { Monitor } from './modules/monitor.js'
import { Logger } from './modules/logger.js'
import { Tabs } from './modules/tabs.js'

const TAG = "install"
const MONITOR_INTERVAL = 5000;
const REDIRECT_DELAY = 2000;

class Install {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            Logger.Log(TAG, 'DOMContentLoaded');
            this.$card = document.querySelector('.card');
            this.$cardText = this.$card.querySelector('.card-header-title');
            this.$cardIcon = this.$card.querySelector('i');
            this.$instructions = document.querySelector('.instructions');
        });

        let timerId = setInterval(async () => {
            if (await Monitor.isAgentInstalled()) {
                this.updateCard();
                this.updateInstructions();
                clearInterval(timerId);
                setTimeout(() => {
                    window.location = '/connections';
                }, REDIRECT_DELAY);
            }
        }, MONITOR_INTERVAL);

        let tabs = new Tabs();
    }

    updateInstructions() {
        this.$instructions.classList.add('has-text-grey-lighter');
    }

    updateCard() {
        this.$card.classList.remove('has-background-light');
        this.$cardText.classList.remove('has-text-black-bis');
        this.$cardIcon.classList.remove('fa-spinner');
        this.$cardIcon.classList.remove('fa-spin');

        this.$card.classList.add('has-background-success');
        this.$cardText.classList.add('has-text-white-bis');
        this.$cardText.innerHTML = 'Prosql-agent working fine!';
        this.$cardIcon.classList.add('fa-check-circle');
        this.$cardIcon.classList.add('has-text-white-bis');
    }
}

new Install()
