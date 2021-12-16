import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { Tabs } from './modules/tabs.js'

class About {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            let $ver = document.querySelector('.agent-version');
            let $contact = document.querySelector('.contact');
            $contact.classList.remove('is-hidden');

            let response = await Utils.get(Constants.URL + '/about', false);
            if (response.status == "ok") {
                $ver.innerHTML = response.data.version;
                return;
            }

            $ver.innerHTML = 'Not detected';
        })

        let tabs = new Tabs();
    }
}

new About()
