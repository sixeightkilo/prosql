import { Err } from './modules/error.js'
import { Logger } from './modules/logger.js'
import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { ConnectionModel } from './modules/connection-model.js'
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

    async init() {
        this.$firstName = document.getElementById('first-name')
        this.$lastName = document.getElementById('last-name')
        this.$email = document.getElementById('email')
        this.$image = document.getElementById('image')
        this.$captcha = document.getElementById('captcha')
        this.$getOtp = document.getElementById('get-otp')
        this.$reset = document.getElementById('reset')
        this.$otp = document.getElementById('otp')
        this.$signup = document.getElementById('signup')

        await this.setCaptcha();

        this.$getOtp.addEventListener('click', () => {
            this.getOtp();
        });

        this.$reset.addEventListener('click', () => {
            this.setCaptcha();
        });

        this.$signup.addEventListener('click', () => {
            this.signup();
        });
    }

    async signup() {
        let json = await Utils.post('/browser-api/login/signup', {'otp': this.$otp.value});

        if (json.status == "ok") {
            window.location = '/connections';
        }
    }

    async setCaptcha() {
        this.$captcha.value = '';
        let json = await Utils.get('/browser-api/login/get-captcha');
        Logger.Log(TAG, JSON.stringify(json));
        if (json.status == "ok") {
            this.$image.src = json.data.image;
            this.$image.dataset.id = json.data['captcha-id'];
        }
    }

    async getOtp() {
        let params = {
            'first-name': this.$firstName.value,
            'last-name': this.$lastName.value,
            'email': this.$email.value,
            'captcha-id': this.$image.dataset.id,
            'captcha-value': this.$captcha.value
        }

        let json = await Utils.post('/browser-api/login/set-otp', params, false);
        Logger.Log(TAG, JSON.stringify(json));
        if (json.status == "error") {
            alert(json.msg);
            this.setCaptcha();
            return;
        }

        alert(`Otp sent to ${this.$email.value}`);
    }
}

new Signup()
