import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'
import HotKeys from 'https://unpkg.com/hotkeys-js@3.8.7/dist/hotkeys.esm.js'

class Hotkeys {
    static init() {
        HotKeys(Constants.SHIFT_R, () => {
            PubSub.publish(Constants.CMD_RUN_QUERY, {});
        });

        HotKeys(Constants.SHIFT_F, () => {
            PubSub.publish(Constants.CMD_FORMAT_QUERY, {});
        });

        HotKeys(Constants.SHIFT_N, () => {
            PubSub.publish(Constants.CMD_NEXT_ROWS, {});
        });

        HotKeys(Constants.SHIFT_P, () => {
            PubSub.publish(Constants.CMD_PREV_ROWS, {});
        });

        HotKeys(Constants.SHIFT_E, () => {
            PubSub.publish(Constants.CMD_EXPORT, {});
        });

        HotKeys(Constants.SHIFT_L, () => {
            PubSub.publish(Constants.CMD_EXPORT_TABLE , {});
        });

        HotKeys(Constants.SHIFT_S, () => {
            PubSub.publish(Constants.CMD_SEARCH_TABLES , {});
        });

        HotKeys(Constants.SHIFT_BACK, () => {
            PubSub.publish(Constants.CMD_BACK , {});
        });
    }
}

export { Hotkeys }
