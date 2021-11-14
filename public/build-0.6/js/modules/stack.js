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

    push(...args) {
        Logger.Log(TAG, JSON.stringify(args))
        if (args.length == 1) {
            this.stack.push({
                'type': 'table',
                'table': args[0]
            })
            Logger.Log(TAG, "table:" + JSON.stringify(this.stack));
            return
        }

        if (args.length == 3) {
            this.stack.push({
                'type': 'fk-ref',
                'table': args[0],
                'column': args[1],
                'value': args[2]
            })

            this.curr++
            this.$back.classList.remove('stack-disable')
            Logger.Log(TAG, "fk-ref:" + JSON.stringify(this.stack));

            return
        }

        if (args.length == 4) {
            this.stack.push({
                'type': 'search',
                'table': args[0],
                'column': args[1],
                'operator': args[2],
                'value': args[3]
            })

            this.curr++
            this.$back.classList.remove('stack-disable')
            Logger.Log(TAG, "search:" + JSON.stringify(this.stack));

            return
        }
    }
}

export { Stack }
