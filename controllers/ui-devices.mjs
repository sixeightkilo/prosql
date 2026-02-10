import User from '../models/user.mjs';
import SigninTrait from '../traits/signin-trait.mjs';

/*
 * Mirrors:
 * Prosql\Controllers\UI\DevicesController
 */
export default class UIDevicesController extends SigninTrait {
    constructor(logger, sessionManager, deviceModel) {
        super(logger, sessionManager);
        this.device = deviceModel;
    }

    /*
     * POST /browser-api/devices/:action
     */
    async handlePost(req, res) {
        this.logger.debug(`handlepost`);
        const body = req.body ?? {};

        this.logger.debug(`body: ${JSON.stringify(body)}`);
        const deviceId = body['device-id'];
        const version = body['version'];
        const os = body['os'] ?? 'unknown';

        // upsert (same as PHP)
        const id = this.device.save({
            device_id: deviceId,
            version,
            os
        });

        const device = this.device.get(
            ['device_id', 'user_id', 'created_at'],
            [['id', '=', id]]
        )[0];

        this.logger.debug('SESSION STATE:' + this.sm.dump());


        // session mutations (order matters)
        this.sm.setDeviceId(deviceId);
        this.sm.setVersion(version);
        this.sm.setOs(os);

        this.logger.debug(`device: ${JSON.stringify(device)}`);
        const signinRequired = this.signinRequired(device);

        // debug toggle existed in PHP – keep behavior identical
        // const signinRequired = true;

        if (signinRequired) {
            // kill session if any
            this.sm.kill();
            throw new Error('signin-required');
        }

        const user = this.sm.getUser();

        if (user?.email) {
            // logged in — return nothing (200 OK, empty body)
            this.logger.debug('logged in');
            res.status(200).end();
            return;
        }

        // continue as guest
        this.sm.setUser({
            'first-name': User.GUEST_FIRST_NAME,
            'last-name': User.GUEST_LAST_NAME,
            'email': User.GUEST_EMAIL
        });

        res.status(200).end();
    }

    /*
     * Static Express entrypoint (Slim-style parity)
     */
    static async handle(req, res, next) {
        try {
            const controller = req.container.uiDevicesController;
            await controller.handlePost(req, res);
        } catch (err) {
            next(err);
        }
    }
}

