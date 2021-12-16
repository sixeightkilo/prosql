import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { Tabs } from './modules/tabs.js'

class Help {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            let $contact = document.querySelector('.contact');
            $contact.classList.remove('is-hidden');
        })
    }
}

new Help()
