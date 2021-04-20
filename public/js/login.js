import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { Db } from './modules/db.js'

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
        this.$ip = document.getElementById('ip')
        this.$port = document.getElementById('port')
        this.$db = document.getElementById('db')
        this.utils = new Utils()

        this.db = new Db()
        try {
            await this.db.openDb()
            await this.db.save({
                'name': 'dev'
            })
        } catch (e) {
            console.log(e)
        }
    }

    async login() {
        let params = {
            user: this.$user.value,
            pass: this.$pass.value,
            ip: this.$ip.value,
            port: this.$port.value,
            db: this.$db.value
        }

        let json = await Utils.fetch(Constants.URL + '/login?' + new URLSearchParams(params))
        console.log(JSON.stringify(json))

        Utils.saveToSession(Constants.SESSION_ID, json.data[Constants.SESSION_ID])
        window.location = '/app';
    }

    async testConn() {
        let params = {
            user: this.$user.value,
            pass: this.$pass.value,
            ip: this.$ip.value,
            port: this.$port.value,
            db: this.$db.value
        }

        let json = await Utils.fetch(Constants.URL + '/ping?' + new URLSearchParams(params))
        console.log(JSON.stringify(json))
        this.utils.showAlert('Connection successful!', 2000)
    }
}

new Login()
