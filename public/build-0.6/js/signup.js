import { Err } from './modules/error.js'
import { Logger } from './modules/logger.js'
import { Utils } from './modules/utils.js'
import { Constants } from './modules/constants.js'
import { ConnectionModel } from './modules/connection-model.js'
import { PubSub } from './modules/pubsub.js'
import { Workers } from './modules/workers.js'
import { QueryDB } from './modules/query-db.js'
import { QueriesMetaDB } from './modules/queries-meta-db.js'
import { ConnectionDB } from './modules/connection-db.js'
import { ConnectionsMetaDB } from './modules/connections-meta-db.js'
import ProgressBar from './modules/progress-bar.js'

const TAG = 'signup'
class Signup {
    constructor() {
        document.addEventListener('DOMContentLoaded', async () => {
            await this.init()
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
            //reset all saved indexeddb records so they can be synced again with the new db
            ProgressBar.setOptions({});//no buttons
            PubSub.publish(Constants.INIT_PROGRESS, {});
            PubSub.publish(Constants.START_PROGRESS, {});
            PubSub.publish(Constants.UPDATE_PROGRESS, {
                message: `Please wait`
            });

            await this.resetAll();

            PubSub.publish(Constants.STOP_PROGRESS, {});
            window.location = '/connections';
        }
    }

    async resetAll() {
        let connDb = new ConnectionDB(new Logger(), {version: Constants.CONN_DB_VERSION});
        await connDb.open();
        let conns = await connDb.getAll();
        Logger.Log(TAG, "Resetting connections..");
        for (let i = 0; i < conns.length; i++) {
            await connDb.reset(conns[i]);
        }
        Logger.Log(TAG, "Done.");

        let queryDb = new QueryDB(new Logger(), {version: Constants.QUERY_DB_VERSION});
        await queryDb.open();
        let queries = await queryDb.getAll();
        Logger.Log(TAG, "Resetting queries..");
        for (let i = 0; i < queries.length; i++) {
            await queryDb.reset(queries[i]);
        }
        Logger.Log(TAG, "Done.");

        Logger.Log(TAG, "Resetting QueriesMetaDB");
        let queriesMetaDb = new QueriesMetaDB(new Logger(), {version: Constants.QUERIES_META_DB_VERSION});
        await queriesMetaDb.open();
        await queriesMetaDb.destroy(Constants.QUERIES_META_KEY);
        Logger.Log(TAG, "Done.");

        Logger.Log(TAG, "Resetting connectionsMetaDb");
        let connectionsMetaDb = new ConnectionsMetaDB(new Logger(), {version: Constants.CONNECTIONS_META_DB_VERSION});
        await connectionsMetaDb.open();
        await connectionsMetaDb.destroy(Constants.CONNECTIONS_META_KEY);
        Logger.Log(TAG, "Done.");
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

        let json = await Utils.post('/browser-api/login/set-signup-otp', params, false);
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
