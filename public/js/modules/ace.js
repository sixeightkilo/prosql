import { PubSub } from './pubsub.js'
import { Constants } from './constants.js'

class Ace {
    static init(elemId) {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.src = '/ace-builds/src-min/ace.js'
            document.head.appendChild(script);

            script.onload = () => {
                let editor = ace.edit(elemId)
                editor.setTheme("ace/theme/github");
                editor.session.setMode("ace/mode/mysql");
                Ace.setKeyBindings(editor);
                resolve(editor)
            };
        });
    }

    static setKeyBindings(editor) {
        editor.commands.addCommand({
            name: Constants.CMD_RUN_QUERY,
            bindKey: {
                win: Constants.SHIFT_R,
                mac: Constants.SHIFT_R,
            },
            exec: (editor) => {
                PubSub.publish(Constants.CMD_RUN_QUERY, {});
            },
            readOnly: true // false if this command should not apply in readOnly mode
        });

        editor.commands.addCommand({
            name: Constants.CMD_NEXT_ROWS,
            bindKey: {
                win: Constants.SHIFT_N,
                mac: Constants.SHIFT_N,
            },
            exec: (editor) => {
                PubSub.publish(Constants.CMD_NEXT_ROWS, {});
            },
            readOnly: true // false if this command should not apply in readOnly mode
        });

        editor.commands.addCommand({
            name: Constants.CMD_PREV_ROWS,
            bindKey: {
                win: Constants.SHIFT_P,
                mac: Constants.SHIFT_P,
            },
            exec: (editor) => {
                PubSub.publish(Constants.CMD_PREV_ROWS, {});
            },
            readOnly: true // false if this command should not apply in readOnly mode
        });

        editor.commands.addCommand({
            name: Constants.CMD_EXPORT,
            bindKey: {
                win: Constants.SHIFT_E,
                mac: Constants.SHIFT_E,
            },
            exec: (editor) => {
                PubSub.publish(Constants.CMD_EXPORT, {});
            },
            readOnly: true // false if this command should not apply in readOnly mode
        });

        editor.commands.addCommand({
            name: Constants.CMD_FORMAT_QUERY,
            bindKey: {
                win: Constants.SHIFT_F,
                mac: Constants.SHIFT_F,
            },
            exec: (editor) => {
                PubSub.publish(Constants.CMD_FORMAT_QUERY, {});
            },
            readOnly: true // false if this command should not apply in readOnly mode
        });
    }
}

export { Ace }
