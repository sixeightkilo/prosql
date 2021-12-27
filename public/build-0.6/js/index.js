import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { Monitor } from './modules/monitor.js'

class Index {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.init()

            this.$getStarted.addEventListener('click', async () => {
                this.getStarted()
            })
        })
    }

    init() {
        this.$getStarted = document.getElementById('get-started')
    }

    async getStarted() {
        if (await Monitor.isAgentInstalled()) {
            window.location = '/connections';
            return;
        }

        window.location = '/install';
    }
}

new Index()
