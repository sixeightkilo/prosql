import { Err } from './modules/error.js'
import { Logger } from './modules/logger.js'
import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { ConnectionModel } from './modules/connection-model.js'
import { PubSub } from './modules/pubsub.js'
import { Workers } from './modules/workers.js'
import { QueriesMetaDB } from './modules/queries-meta-db.js'
import ProgressBar from './modules/progress-bar.js'

const TAG = 'signin'
class Signin {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            await this.init()
        });
    }

    async init() {
        this.$email = document.getElementById('email')
        this.$image = document.getElementById('image')
        this.$getOtp = document.getElementById('get-otp')
        this.$otp = document.getElementById('otp')
        this.$signin = document.getElementById('signin')

        this.$signin.addEventListener('click', () => {
            this.signin();
        });

        this.$getOtp.addEventListener('click', () => {
            this.getOtp();
        });
    }

    async signin() {
        let json = await Utils.post('/browser-api/login/signin', {'otp': this.$otp.value});

        if (json.status == "ok") {
            window.location = '/connections';
        }
    }

    async getOtp() {
        let params = {
            'email': this.$email.value,
        }

        let json = await Utils.post('/browser-api/login/set-signin-otp', params, false);
        Logger.Log(TAG, JSON.stringify(json));
        if (json.status == "error") {
            alert(json.msg);
            return;
        }

        alert(`Otp sent to ${this.$email.value}`);
    }
}

new Signin()
