import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'

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

    init() {
        this.$testConn = document.getElementById('test')
        this.$login = document.getElementById('login')
        this.$user = document.getElementById('user')
        this.$pass = document.getElementById('pass')
        this.$ip = document.getElementById('ip')
        this.$port = document.getElementById('port')
        this.$db = document.getElementById('db')
    }

    async login() {
        let params = {
            user: this.$user.value,
            pass: this.$pass.value,
            ip: this.$ip.value,
            port: this.$port.value,
            db: this.$db.value
        }

        let response = await fetch(Constants.URL + '/login?' + new URLSearchParams(params))
        let json = await response.json()
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

        let response = await fetch(Constants.URL + '/ping?' + new URLSearchParams(params))
        let json = await response.json()
        console.log(JSON.stringify(json))
    }
}

new Login()
