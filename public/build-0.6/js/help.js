import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { Tabs } from './modules/tabs.js'

class Help {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            let $email = document.querySelector('.email');
            $email.classList.remove('is-hidden');
        })
    }
}

new Help()
