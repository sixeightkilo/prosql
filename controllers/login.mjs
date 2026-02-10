import fetch from 'node-fetch';
import pug from 'pug';

import User from '../models/user.mjs';
import Device from '../models/device.mjs';
import Validator from '../utils/validator.mjs';

export default class LoginController {
    static MIN = 100000;
    static MAX = 999999;

    constructor(logger, sessionManager) {
        this.logger = logger;
        this.sm = sessionManager;

        this.path = '';
        this.emailer = null;
        this.user = null;
        this.device = null;

        // match PHP Pug config
        this.pug = pug;
    }

    setDownloadPath(path) {
        this.path = path;
        return this;
    }

    setEmailer(emailer) {
        this.emailer = emailer;
        return this;
    }

    setUser(user) {
        this.user = user;
        return this;
    }

    setDevice(device) {
        this.device = device;
        return this;
    }

    /* -------------------------
     * routing
     * ------------------------- */

    async handleGet(req, res) {
        const action = req.params.action;

        switch (action) {
            case 'get-captcha': {
                const result = await this.getCaptcha();
                res.json(result);
                return;
            }

            default:
                throw new Error('invalid-operation');
        }
    }

    async handlePost(req, res) {
        const action = req.params.action;

        switch (action) {
            case 'set-signup-otp':
                await this.setSignupOtp(req);
                res.status(200).end();
                return;

            case 'set-signin-otp':
                await this.setSigninOtp(req);
                res.status(200).end();
                return;

            case 'signup':
                await this.signup(req);
                res.status(200).end();
                return;

            case 'signin':
                await this.signin(req);
                res.status(200).end();
                return;

            default:
                throw new Error('invalid-operation');
        }
    }

    /* -------------------------
     * actions
     * ------------------------- */

    async signup(req) {
        const otp = req.body.otp;

        if (this.sm.getOtp() !== otp) {
            throw new Error('Invalid otp');
        }

        const user = this.sm.getTempUser();
        if (!user) {
            throw new Error('No details provided');
        }

        this.logger.debug('Signing up:', user);

        const userId = this.user.save({
            first_name: user['first-name'],
            last_name: user['last-name'],
            email: user.email
        });

        this.device.setUserId(this.sm.getDeviceId(), userId);

        this.sm.setTempUser({});
        this.sm.setOtp('');
        this.sm.setUser(user);
        this.sm.write();
    }

    async signin(req) {
        const otp = req.body.otp;

        if (this.sm.getOtp() !== otp) {
            throw new Error('Invalid otp');
        }

        const tempUser = this.sm.getTempUser();
        this.logger.debug('Signing in:', tempUser);

        const user = this.user.get(
            ['id', 'first_name', 'last_name', 'email'],
            [['email', '=', tempUser.email]]
        )[0];

        this.device.setUserId(this.sm.getDeviceId(), user.id);

        this.sm.setTempUser({});
        this.sm.setOtp('');
        this.sm.setUser(user);
        this.sm.write();
    }

    async setSignupOtp(req) {
        const p = req.body;

        await this.verifyCaptcha(p['captcha-id'], p['captcha-value']);

        Validator.validate([
            { field: p['first-name'], alias: 'First name', rules: ['NOT_EMPTY'] },
            { field: p['last-name'], alias: 'Last name', rules: ['NOT_EMPTY'] },
            { field: p.email, alias: 'email', rules: ['IS_EMAIL'] }
        ]);

        const email = this.user.get(
            ['email'],
            [['email', '=', p.email]]
        )[0]?.email ?? null;

        this.logger.debug(`email: ${email}`);

        if (email) {
            throw new Error('Already registered. Please sign in');
        }

        const otp = Math.floor(
            Math.random() * (LoginController.MAX - LoginController.MIN + 1)
        ) + LoginController.MIN;

        this.sm.setOtp(otp);
        this.sm.setTempUser({
            'first-name': p['first-name'],
            'last-name': p['last-name'],
            'email': p.email
        });

        this.sm.setDeviceId(p['device-id']);
        this.sm.setVersion(p.version);
        this.sm.setOs(p.os);
        this.sm.write();

        const msg = this.pug.renderFile(
            new URL('./templates/signup-otp.pug', import.meta.url).pathname,
            {
                name: `${p['first-name']} ${p['last-name']}`,
                otp
            }
        );

        await this.emailer.send(
            p.email,
            [],
            'Your OTP for signing up!',
            msg
        );
    }

    async setSigninOtp(req) {
        const p = req.body;

        const user = this.user.get(
            ['first_name', 'last_name', 'email'],
            [['email', '=', p.email]]
        )[0] ?? null;

        this.logger.debug('user:', user);

        if (!user) {
            throw new Error('Unknown user. Please sign up first.');
        }

        const otp = Math.floor(
            Math.random() * (LoginController.MAX - LoginController.MIN + 1)
        ) + LoginController.MIN;

        this.sm.setOtp(otp);
        this.sm.setTempUser({
            'first-name': user.first_name,
            'last-name': user.last_name,
            'email': user.email
        });

        this.sm.setDeviceId(p['device-id']);
        this.sm.setVersion(p.version);
        this.sm.setOs(p.os);
        this.sm.write();

        const msg = this.pug.renderFile(
            new URL('./templates/signup-otp.pug', import.meta.url).pathname,
            {
                name: `${user.first_name} ${user.last_name}`,
                otp
            }
        );

        await this.emailer.send(
            p.email,
            [],
            'Your OTP for signing in!',
            msg
        );
    }

    /* -------------------------
     * captcha
     * ------------------------- */

    async getCaptcha() {
        const res = await fetch('http://localhost:8777/api/getCaptcha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                CaptchaType: 'digit',
                DriverDigit: {
                    DotCount: 80,
                    Height: 80,
                    Length: 6,
                    MaxSkew: 0.7,
                    Width: 240
                }
            })
        });

        const result = await res.json();

        return {
            'captcha-id': result.captchaId,
            image: result.data
        };
    }

    async verifyCaptcha(id, value) {
        const res = await fetch('http://localhost:8777/api/verifyCaptcha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Id: id,
                VerifyValue: value
            })
        });

        const result = await res.json();

        if (result.msg === 'failed') {
            throw new Error('Invalid captcha');
        }
    }

    /* -------------------------
     * express entrypoints
     * ------------------------- */

    static async handle(req, res, next) {
        try {
            const controller = req.container.loginController;

            if (req.method === 'GET') {
                await controller.handleGet(req, res);
            } else {
                await controller.handlePost(req, res);
            }
        } catch (err) {
            next(err);
        }
    }
}

