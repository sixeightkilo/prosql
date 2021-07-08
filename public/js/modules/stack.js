import { Log } from './logger.js'

const TAG = "stack"

class Stack {
    constructor(cb) {
        this.cb = cb
        this.stack = []
        this.curr = 0

        this.$fwd = document.getElementById('fwd')
        this.$back = document.getElementById('back')

        this.$fwd.addEventListener('click', async () => {
            if (this.stack.length == 0) {
                return
            }
        })

        this.$back.addEventListener('click', async () => {
            Log(TAG, `${this.stack.length}: ${this.curr}`)

            if (this.stack.length == 0) {
                return
            }

            if (this.curr == 0) {
                return
            }

            this.curr--
            await cb(this.stack[this.curr])
            Log(TAG, "Done back")
            if (this.curr == 0) {
                this.$back.classList.add('stack-disable')
            }
        })
    }

    reset() {
        this.stack = []
        this.curr = 0
        this.$fwd.classList.add('stack-disable')
        this.$back.classList.add('stack-disable')
    }

    push(...args) {
        Log(TAG, JSON.stringify(args))
        if (args.length == 1) {
            this.stack.push({
                'type': 'table',
                'table': args[0]
            })
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

            return
        }
    }
}

export { Stack }
