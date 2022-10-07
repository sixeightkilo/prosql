import { PubSub } from './pubsub.js'
import { Constants } from './constants.js'
import { Logger } from './logger.js'

const TAG = 'ace';
const MAX_COL = 100000;

class Ace {
    constructor(elemId) {
        this.elemId = elemId
    }

    init() {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.src = '/static/ace-builds/src-min/ace.js'
            document.head.appendChild(script);

            script.onload = () => {
                this.editor = ace.edit(this.elemId)
                this.range = ace.require('ace/range').Range

                this.editor.setTheme("ace/theme/github");
                this.editor.session.setMode("ace/mode/mysql");
                this.editor.setHighlightActiveLine(false);

                this.editor.textInput.getElement().addEventListener('keyup', () => {
                    this.onKeyup();
                })

                this.editor.on('dblclick', (e) => {
                    Logger.Log(TAG, 'dblclick');
                    this.onKeyup();
                });

                this.editor.on('mousedown', (e) => {
                    Logger.Log(TAG, 'mousedown');
                    setTimeout(() => {
                        this.onKeyup();
                    }, 5);
                });

                this.editor.session.on('change', (e) => {
                    PubSub.publish(Constants.EDITOR_TEXT_CHANGED, {
                        text: this.editor.getValue()
                    });
                });

                this.setKeyBindings();

                resolve()
            };
        });
    }

    resize() {
        this.editor.resize();
    }

    setValue(v) {
        if (!this.selRange) {
            this.editor.setValue(v);
            return;
        }
        this.editor.session.replace(this.selRange, v + ";");

        this.editor.$search.setOptions({
            needle: ';',
            backwards: true,
            preventScroll: true,
        });

        let cursor = this.editor.selection.getCursor();
        this.editor.moveCursorTo(cursor.row, cursor.column - 1);

        //and highlight it
        this.onKeyup()
    }

    clearSelection() {
        this.editor.clearSelection();
    }

    focus() {
        this.editor.focus();
    }

    getValue() {
        if (!this.selRange) {
            return this.editor.getValue();
        }

        let v = this.editor.session.getTextRange(this.selRange);
        return this.cleanup(v);
    }

    getAll() {
        return this.editor.getValue();
    }

    cleanup(str) {
        //remove spaces and ;
        let chars = [' ', ';'];
        let start = 0, 
            end = str.length;

        while(start < end && chars.indexOf(str[start]) >= 0)
            ++start;

        while(end > start && chars.indexOf(str[end - 1]) >= 0)
            --end;

        return (start > 0 || end < str.length) ? str.substring(start, end) : str;
    }

    onKeyup(e) {
        if (this.marker) {
            this.editor.session.removeMarker(this.marker);
        }

        let cursor = this.editor.selection.getCursor();
        Logger.Log(TAG, JSON.stringify(cursor));

        this.updateSelRange(cursor);
        if (this.selRange) {
            this.marker = this.editor.session.addMarker(this.selRange, "ace_active-line", "text");
        }
    }

    updateSelRange(cursor) {
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

        Logger.Log(TAG, JSON.stringify(ranges));
        if (ranges.length == 0) {
            this.selRange = null;
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

        //if there are no characters starting from startRange, shift to next row
        let check = this.editor.session.getTextRange(new this.range(startRow, startColumn, startRow, MAX_COL));
        check = this.cleanup(check);
        if (!check) {
            startRow++;
            startColumn = 0;
        } else {
            //shift to the first non white space character, unless its the start of the line
            if (startColumn > 0) {
                startColumn++;
            }
        }

        Logger.Log(TAG, `sr ${startRow} sc ${startColumn} er ${endRow} ec ${endColumn}`);
        this.selRange = new this.range(startRow, startColumn, endRow, endColumn);
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
                win: Constants.SHIFT_T,
                mac: Constants.SHIFT_T
            },
            exec: (editor) => {
                Logger.Log(TAG, "format");
                PubSub.publish(Constants.CMD_FORMAT_QUERY, {});
            },
            readOnly: true // false if this command should not apply in readOnly mode
        });

        this.editor.commands.addCommand({
            name: Constants.CMD_RUN_ALL,
            bindKey: {
                win: Constants.SHIFT_A,
                mac: Constants.SHIFT_A
            },
            exec: (editor) => {
                Logger.Log(TAG, "runall");
                PubSub.publish(Constants.CMD_RUN_ALL, {});
            },
            readOnly: true // false if this command should not apply in readOnly mode
        });
    }
}

export { Ace }
