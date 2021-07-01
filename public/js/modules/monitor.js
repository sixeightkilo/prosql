import { Utils } from './utils.js'
import { Constants } from './constants.js'
import { Log } from './logger.js'

const TAG = "monitor"
class Monitor {
    static async isAgentInstalled() {
        let response = await Utils.fetch(Constants.URL + '/about', false);
        if (response.status == "ok") {
            return true;
        }

        return false;
    }
}

export { Monitor }
