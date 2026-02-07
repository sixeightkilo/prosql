import ace from 'ace-builds';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/mode-mysql';
import 'ace-builds/src-noconflict/theme-github';

import { PubSub } from './pubsub.js';
import { Constants } from './constants.js';
import { Logger } from './logger.js';

const TAG = 'ace';
const MAX_COL = 100000;

class Ace {
    constructor(elemId) {
        this.elemId = elemId;
        this.editor = null;
        this.range = null;
        this.marker = null;
        this.selRange = null;
    }

    init() {
        return new Promise((resolve) => {
            Logger.Log(TAG, 'initializing ace editor');
            this.editor = ace.edit(this.elemId);
            this.range = ace.require('ace/range').Range;

            this.editor.setTheme('ace/theme/github');
            this.editor.session.setMode('ace/mode/mysql');
            this.editor.setHighlightActiveLine(false);

            this.editor.textInput.getElement().addEventListener('keyup', () => {
                this.onKeyup();
            });

            this.editor.on('dblclick', () => {
                Logger.Log(TAG, 'dblclick');
                this.onKeyup();
            });

            this.editor.on('mousedown', () => {
                Logger.Log(TAG, 'mousedown');
                setTimeout(() => this.onKeyup(), 5);
            });

            this.editor.session.on('change', () => {
                PubSub.publish(Constants.EDITOR_TEXT_CHANGED, {
                    text: this.editor.getValue()
                });
            });

            this.setKeyBindings();
            resolve();
        });
    }

    resize() {
        this.editor.resize();
    }

    focus() {
        this.editor.focus();
    }

    clearSelection() {
        this.editor.clearSelection();
    }

    getAll() {
        return this.editor.getValue();
    }

    getValue() {
        if (!this.selRange) {
            return this.editor.getValue();
        }
        return this.cleanup(
            this.editor.session.getTextRange(this.selRange)
        );
    }

    setValue(v) {
        if (!this.selRange) {
            this.editor.setValue(v);
            return;
        }

        this.editor.session.replace(this.selRange, v + ';');

        this.editor.$search.setOptions({
            needle: ';',
            backwards: true,
            preventScroll: true
        });

        const cursor = this.editor.selection.getCursor();
        this.editor.moveCursorTo(cursor.row, cursor.column - 1);
        this.onKeyup();
    }

    cleanup(str) {
        const chars = [' ', ';'];
        let start = 0;
        let end = str.length;

        while (start < end && chars.includes(str[start])) start++;
        while (end > start && chars.includes(str[end - 1])) end--;

        return str.substring(start, end);
    }

    onKeyup() {
        if (this.marker) {
            this.editor.session.removeMarker(this.marker);
        }

        const cursor = this.editor.selection.getCursor();
        Logger.Log(TAG, JSON.stringify(cursor));

        this.updateSelRange(cursor);

        if (this.selRange) {
            this.marker = this.editor.session.addMarker(
                this.selRange,
                'ace_active-line',
                'text'
            );
        }
    }

    updateSelRange(cursor) {
        this.editor.$search.setOptions({
            needle: ';',
            backwards: true,
            preventScroll: true,
            wrap: true
        });

        const ranges = this.editor.$search.findAll(this.editor.session);

        if (!ranges.length) {
            this.selRange = null;
            return;
        }

        let startRow = 0;
        let startColumn = 0;
        let endRow = this.editor.session.getLength() - 1;
        let endColumn = MAX_COL;

        for (const r of ranges) {
            if (r.start.row < cursor.row ||
                (r.start.row === cursor.row && r.start.column < cursor.column)) {
                startRow = r.start.row;
                startColumn = r.start.column;
            }
        }

        for (const r of ranges) {
            if (r.start.row > cursor.row ||
                (r.start.row === cursor.row && r.start.column >= cursor.column)) {
                endRow = r.end.row;
                endColumn = r.end.column;
                break;
            }
        }

        let check = this.editor.session.getTextRange(
            new this.range(startRow, startColumn, startRow, MAX_COL)
        );
        check = this.cleanup(check);

        if (!check) {
            startRow++;
            startColumn = 0;
        } else if (startColumn > 0) {
            startColumn++;
        }

        Logger.Log(TAG, `sr ${startRow} sc ${startColumn} er ${endRow} ec ${endColumn}`);
        this.selRange = new this.range(startRow, startColumn, endRow, endColumn);
    }

    setKeyBindings() {
        const bind = (name, key) => ({
            name,
            bindKey: { win: key, mac: key },
            exec: () => PubSub.publish(name, {}),
            readOnly: true
        });

        this.editor.commands.addCommand(bind(Constants.CMD_RUN_QUERY, Constants.SHIFT_R));
        this.editor.commands.addCommand(bind(Constants.CMD_NEXT_ROWS, Constants.SHIFT_N));
        this.editor.commands.addCommand(bind(Constants.CMD_PREV_ROWS, Constants.SHIFT_P));
        this.editor.commands.addCommand(bind(Constants.CMD_EXPORT, Constants.SHIFT_E));
        this.editor.commands.addCommand(bind(Constants.CMD_FORMAT_QUERY, Constants.SHIFT_T));
        this.editor.commands.addCommand(bind(Constants.CMD_RUN_ALL, Constants.SHIFT_A));
    }
}

export { Ace };
