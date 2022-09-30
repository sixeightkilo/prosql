import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { PubSub } from './pubsub.js'

const TAG = "stack"

class Stack {
    constructor(cb) {
        this.cb = cb
        this.stack = []
        this.curr = 0

        this.$back = document.getElementById('back')
        this.$back.addEventListener('click', async () => {
            this.handleCmd(Constants.CMD_BACK);
        });

        [
            Constants.CMD_BACK,
        ].forEach((c) => {
            ((c) => {
                PubSub.subscribe(c, () => {
                    this.handleCmd(c);
                });
            })(c)
        });
    }

    async handleBack() {
        Logger.Log(TAG, `${this.stack.length}: ${this.curr}`)

        if (this.stack.length == 0) {
            return
        }

        if (this.curr == 0) {
            return
        }

        this.curr--
        this.stack.pop();
        await this.cb(this.stack[this.curr])
        Logger.Log(TAG, "Done back")
        if (this.curr == 0) {
            this.$back.classList.add('stack-disable')
        }
    }

    async handleCmd(cmd) {
        switch (cmd) {
            case Constants.CMD_BACK:
                this.handleBack();
                break;
        }
    }

    reset() {
        this.stack = []
        this.curr = 0
        this.$back.classList.add('stack-disable')
    }

    push(o) {
        this.stack.push(o);
        if (o.type == 'table') {
            return;
        }

        this.curr++
        this.$back.classList.remove('stack-disable')
    }
}

export { Stack }
