class Main {
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
        //pages
        this.$loginPage = document.getElementById('login-container')
        this.$appPage = document.getElementById('app-container')

        this.$testConn = document.getElementById('test')
        this.$login = document.getElementById('login')
        this.$user = document.getElementById('user')
        this.$pass = document.getElementById('pass')
        this.$ip = document.getElementById('ip')
        this.$port = document.getElementById('port')
        this.$db = document.getElementById('db')
    }

    async login() {
        this.$loginPage.style.display = 'none'
        this.$appPage.style.display = 'block'

        let params = {
            user: this.$user.value,
            pass: this.$pass.value,
            ip: this.$ip.value,
            port: this.$port.value,
            db: this.$db.value
        }

        let response = await fetch('http://localhost:23890/login?' + new URLSearchParams(params))
        let json = await response.json()
        console.log(JSON.stringify(json))
    }

    async testConn() {
        let params = {
            user: this.$user.value,
            pass: this.$pass.value,
            ip: this.$ip.value,
            port: this.$port.value,
            db: this.$db.value
        }

        let response = await fetch('http://localhost:23890/ping?' + new URLSearchParams(params))
        let json = await response.json()
        console.log(JSON.stringify(json))
    }
}

new Main()
