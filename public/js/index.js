import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'

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

    getStarted() {
        window.location = '/login';
    }
}

new Index()
