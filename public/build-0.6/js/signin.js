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
            //if db name has changed, reset all dbs
            let queriesMetaDb = new QueriesMetaDB(new Logger(), {version: Constants.QUERIES_META_DB_VERSION});
            await queriesMetaDb.open();

            if (await queriesMetaDb.getDbName() != json.data['db-name']) {
                ProgressBar.setOptions({});//no buttons
                PubSub.publish(Constants.INIT_PROGRESS, {});
                PubSub.publish(Constants.START_PROGRESS, {});
                PubSub.publish(Constants.UPDATE_PROGRESS, {
                    message: `Please wait`
                });

                await Utils.resetAll();
                PubSub.publish(Constants.STOP_PROGRESS, {});
            }

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
