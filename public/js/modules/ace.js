import { PubSub } from './pubsub.js'
import { Constants } from './constants.js'
import { Log } from './logger.js'

const TAG = 'ace';
const MAX_COL = 100000;

class Ace {
    init(elemId) {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.src = '/ace-builds/src-min/ace.js'
            document.head.appendChild(script);

            script.onload = () => {
                this.editor = ace.edit(elemId)
                this.range = ace.require('ace/range').Range

                this.editor.setTheme("ace/theme/github");
                this.editor.session.setMode("ace/mode/mysql");
                this.editor.setHighlightActiveLine(false);
                this.editor.textInput.getElement().addEventListener('keyup', () => {
                    this.onKeyup();
                })

                //this.editor.on('change', (e) => {
                    //this.onChange(e);
                //});

                this.setKeyBindings();

                resolve(this.editor)
            };
        });
    }

    onKeyup(e) {

        if (this.marker) {
            this.editor.session.removeMarker(this.marker);
        }

        let cursor = this.editor.selection.getCursor();
        Log(TAG, JSON.stringify(cursor));

        this.editor.$search.setOptions({
            needle: ';',
            backwards: true,
            preventScroll: true,
            wrap: true
        });

        let startRow = 0;
        let startColumn = 0;
        let endRow = (this.editor.session.getLength() - 1);
        let endColumn = MAX_COL;

        let ranges = this.editor.$search.findAll(this.editor.session);

        Log(TAG, JSON.stringify(ranges));
        if (ranges.length == 0) {
            return;
        }

        //determine start position of marker
        for (let i = 0; i < ranges.length; i++) {
            let r = ranges[i];
            //for start position , the range start MUST be <= cursor position
            if (r.start.row <= cursor.row) {
                //if ; is on a previous line, definitely it should be considered
                if (r.start.row < cursor.row) {
                    startRow = r.start.row;
                    startColumn = r.start.column;
                }

                //if ; is on the same line we can consider it only if its column is less than
                //current cursor position
                if (r.start.row == cursor.row) {
                    if (r.start.column < cursor.column) {
                        startRow = r.start.row;
                        startColumn = r.start.column;
                    }
                }
            }
        }

        //determine end poisition of marker
        for (let i = 0; i < ranges.length; i++) {
            let r = ranges[i];

            if (r.start.row > cursor.row) {
                endRow = r.end.row;
                endColumn = r.end.column;
                //ranges are ordered , so if we find a ; on next row, it must 
                //be the closest one. There is nothing more to do
                break;
            }

            if (r.start.row == cursor.row) {
                if (r.start.column >= cursor.column) {
                    endRow = r.end.row;
                    endColumn = r.end.column;
                    break;
                }
            }
        }

        Log(TAG, `sr ${startRow} sc ${startColumn} er ${endRow} ec ${endColumn}`);
        this.marker = this.editor.session.addMarker(
            new this.range(startRow, startColumn, endRow, endColumn), "ace_active-line", "text");

        Log(TAG, this.editor.session.getTextRange(new this.range(startRow, startColumn, endRow, endColumn)));
    }

    setKeyBindings() {
        this.editor.commands.addCommand({
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

        this.editor.commands.addCommand({
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

        this.editor.commands.addCommand({
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

        this.editor.commands.addCommand({
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

        this.editor.commands.addCommand({
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
