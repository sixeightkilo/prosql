import { Log } from './modules/logger.js'
import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { IndexDB } from './modules/index-db.js'

const TAG = 'login'
class Login {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            this.init()

            this.$testConn.addEventListener('click', async () => {
                this.testConn()
            })

            this.$login.addEventListener('click', async () => {
                this.login()
            })
        })
    }

    async init() {
        this.$testConn = document.getElementById('test')
        this.$login = document.getElementById('login')
        this.$user = document.getElementById('user')
        this.$pass = document.getElementById('pass')
        this.$host = document.getElementById('host')
        this.$port = document.getElementById('port')
        this.$db = document.getElementById('db')
        this.utils = new Utils()
    }

    async login() {
        let creds = this.getCreds()
        if (await this.ping(creds) == 'ok') {
            Utils.saveToSession(Constants.CREDS, JSON.stringify(creds))
            window.location = '/app';
        }
    }

    async testConn() {
        let creds = this.getCreds()
        if (await this.ping(creds) == 'ok') {
            this.utils.showAlert('Connection successful!', 2000)
        }
    }

    async ping(creds) {
        let json = await Utils.fetch(Constants.URL + '/ping?' + new URLSearchParams(creds))
        return json.status
    }

    getCreds() {
        return {
            user: this.$user.value,
            pass: this.$pass.value,
            host: this.$host.value,
            port: this.$port.value,
            db: this.$db.value
        }
    }
}

new Login()
