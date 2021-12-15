import { Err } from './modules/error.js'
import { Logger } from './modules/logger.js'
import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { Connections } from './modules/connections.js'
import { PubSub } from './modules/pubsub.js'
import { Workers } from './modules/workers.js'

const TAG = 'signup'
class Signup {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            await this.init()
//
            //this.$testConn.addEventListener('click', async () => {
                //this.testConn()
            //})
//
            //this.$login.addEventListener('click', async () => {
                //this.login()
            //})
        });
    }

    async initDom() {
        this.$getOtp = document.getElementById('get-otp')
        //this.$image = document.getElementById('image')
        //let json = await Utils.fetch('/browser-api/login/captcha');
        //Logger.Log(TAG, JSON.stringify(json));
        this.$getOtp.addEventListener('click', () => {
            this.getOtp();
        });
    }

    async getOtp() {
        let params = {
            'first-name': 'Pankaj',
            'last-name': 'Kargirwar',
            'email': 'kargirwar@gmail.com',
        }
        let url = '/browser-api/login/get-otp?' + new URLSearchParams(params);
        let json = await Utils.fetch(url);
    }

    async init() {
		this.initDom();
    }
}

new Signup()
