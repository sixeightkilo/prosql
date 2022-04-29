import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { Tabs } from './modules/tabs.js'

const LATEST_VERSION = "0.6.4";
class About {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {

            let response = await Utils.get(Constants.URL + '/about', false);
            if (response.status == "ok") {
                let $ver = document.querySelector('#agent-version');
                $ver.innerHTML = response.data.version;
                if (response.data.version < LATEST_VERSION) {
                    let $updateNotice = document.querySelector('#update-notice');
                    $updateNotice.innerText = `Please update to ${LATEST_VERSION}`;
                    $updateNotice.classList.remove('is-hidden');
                }
                return;
            }

            $ver.innerHTML = 'Not detected';
        })

        let tabs = new Tabs();
    }
}

new About()
