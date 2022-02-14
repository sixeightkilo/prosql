import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { Monitor } from './modules/monitor.js'

const TAG = "index";
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

        Logger.Log(TAG, "install");
        //window.location = '/install';
    }
}

new Index()
