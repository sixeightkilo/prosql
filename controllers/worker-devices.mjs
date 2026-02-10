import User from '../models/user.mjs';
import SigninTrait from '../traits/signin-trait.mjs';

export default class WorkerDevicesController extends SigninTrait {
    constructor(logger, sessionManager, deviceModel) {
        super(logger, sessionManager);
        this.device = deviceModel;
    }

    static async handle(req, res, next) {
        try {
            // instance-per-request (closest to Slim behavior)
            const controller = req.container.workerDevicesController;
            const result = await controller.handlePost(req);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }

    async handlePost(req) {
        const body = req.body;

        const deviceId = body['device-id'];
        const version = body['version'];
        const os = body['os'] ?? 'unknown';

        if (!deviceId || !version) {
            throw new Error('missing required fields');
        }

        // upsert device
        const id = await this.device.save({
            device_id: deviceId,
            version,
            os
        });

        const device = (await this.device.get(
            ['user_id', 'created_at'],
            [['id', '=', id]]
        ))[0];

        if (this.signinRequired(device)) {
            throw new Error('signin required');
        }

        // resolve db identifier
        const user = this.sm.getUser() ?? {};
        const userEmail = user.email ?? User.GUEST_EMAIL;

        return {
            db: userEmail === User.GUEST_EMAIL ? deviceId : userEmail
        };
    }
}
