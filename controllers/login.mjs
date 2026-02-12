import fetch from 'node-fetch';
import pug from 'pug';
import svgCaptcha from 'svg-captcha';
import crypto from 'crypto';

import User from '../models/user.mjs';
import Device from '../models/device.mjs';
import Validator from '../utils/validator.mjs';
import AppError from '../errors/app-error.mjs';
const TAG = 'LoginController';

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
                // res.json(result);
                res.json({
                    status: 'ok',
                    data: result
                });
                return;
            }

            default:
                throw new Error('invalid-operation');
        }
    }

    async handlePost(req, res, next) {
        try {
            const action = req.params.action;

            let data = null;

            switch (action) {
                case 'set-signup-otp':
                    data = await this.setSignupOtp(req);
                    break;

                case 'set-signin-otp':
                    data = await this.setSigninOtp(req);
                    break;

                case 'signup':
                    data = await this.signup(req);
                    break;

                case 'signin':
                    data = await this.signin(req);
                    break;

                default:
                    throw new Error('invalid-operation');
            }

            res.json({
                status: 'ok',
                data
            });

        } catch (err) {
            next(err);
        }
    }


    /* -------------------------
     * actions
     * ------------------------- */

    async signup(req) {
        const otp = req.body.otp;

        // if (this.sm.getOtp() !== otp) {
        //     throw new Error('Invalid otp');
        // }

        const enteredOtp = Number(req.body.otp);
        const expectedOtp = Number(this.sm.getOtp());

        if (enteredOtp !== expectedOtp) {
            throw new Error('Invalid otp');
        }

        const user = this.sm.getTempUser();
        if (!user) {
            throw new Error('No details provided');
        }

        this.logger.info(TAG, `Signing up: ${JSON.stringify(user)}`);

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

        this.logger.info(TAG, `OTP entered: ${otp}, OTP expected: ${this.sm.getOtp()}`);

        const enteredOtp = Number(req.body.otp);
        const expectedOtp = Number(this.sm.getOtp());

        if (enteredOtp !== expectedOtp) {
            throw new Error('Invalid otp');
        }

        const tempUser = this.sm.getTempUser();
        this.logger.info(TAG, `Signing in: ${JSON.stringify(tempUser)}`);

        // const user = this.user.get(
        //     ['id', 'first_name', 'last_name', 'email'],
        //     [['email', '=', tempUser.email]]
        // )[0];

        const user = this.user.getByEmail(tempUser.email);

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

        // const email = this.user.get(
        //     ['email'],
        //     [['email', '=', p.email]]
        // )[0]?.email ?? null;
        const email = this.user.getByEmail(p.email)?.email ?? null;

        this.logger.info(TAG, `email: ${email}`);

        if (email) {
            // throw new Error('Already registered. Please sign in');
            throw new AppError('Already registered. Please sign in', 400);
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

        // const user = this.user.get(
        //     ['first_name', 'last_name', 'email'],
        //     [['email', '=', p.email]]
        // )[0] ?? null;
        const user = this.user.getByEmail(p.email);

        this.logger.info(TAG, `email: ${p.email}, user: ${JSON.stringify(user)}`);

        if (!user) {
            // throw new Error('Unknown user. Please sign up first.');
            throw new AppError('Unknown user. Please sign up first.', 400);
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

    // async getCaptcha() {
    //     const res = await fetch('http://localhost:8777/api/getCaptcha', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             CaptchaType: 'digit',
    //             DriverDigit: {
    //                 DotCount: 80,
    //                 Height: 80,
    //                 Length: 6,
    //                 MaxSkew: 0.7,
    //                 Width: 240
    //             }
    //         })
    //     });

    //     const result = await res.json();

    //     return {
    //         'captcha-id': result.captchaId,
    //         image: result.data
    //     };
    // }

    // async verifyCaptcha(id, value) {
    //     const res = await fetch('http://localhost:8777/api/verifyCaptcha', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             Id: id,
    //             VerifyValue: value
    //         })
    //     });

    //     const result = await res.json();

    //     if (result.msg === 'failed') {
    //         throw new Error('Invalid captcha');
    //     }
    // }
    async getCaptcha(req) {
        const captcha = svgCaptcha.create({
            size: 6,
            noise: 3,
            color: true,
            background: '#ffffff',
            ignoreChars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
            charPreset: '0123456789'
        });

        // generate id
        const captchaId = crypto.randomUUID();

        // store solution in session
        this.sm.setCaptcha({
            id: captchaId,
            value: captcha.text
        });

        return {
            'captcha-id': captchaId,
            image: `data:image/svg+xml;base64,${Buffer.from(captcha.data).toString('base64')}`
        };
    }

    async verifyCaptcha(id, value) {
        const stored = this.sm.getCaptcha();
        this.logger.info(TAG, `Verifying captcha. Stored: ${JSON.stringify(stored)}, Received: id=${id}, value=${value}`);

        if (!stored || stored.id !== id || stored.value !== value) {
            // throw new Error('Invalid captcha');
            throw new AppError('Invalid captcha', 400);
        }

        // optional: clear after verification
        this.sm.setCaptcha(null);
    }


    /* -------------------------
     * express entrypoints
     * ------------------------- */

    static async handle(req, res, next) {
        try {
            const controller = req.container.loginController;

            if (req.method === 'GET') {
                await controller.handleGet(req, res, next);
            } else {
                await controller.handlePost(req, res, next);
            }
        } catch (err) {
            next(err);
        }
    }
}

