import User from '../models/user.mjs';
import SigninTrait from '../traits/signin-trait.mjs';
import AppError from '../errors/app-error.mjs';
import SigninRequiredError from '../errors/signin-required-error.mjs';

const TAG = "worker-devices";
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
            res.json({
                status: "ok",
                data: result
            });
        } catch (err) {
            next(err);
        }
    }

    async handlePost(req) {
        const body = req.body;

        const deviceId = body['device-id'];
        const version = body['version'];
        const os = body['os'] ?? 'unknown';

        this.logger.info(TAG, `Device registration request: ${JSON.stringify(body)}`);

        if (!deviceId || !version) {
            this.logger.info(TAG, `Device registration request: ${JSON.stringify(body)}`);
            throw new AppError('device-id and version are required', 400);
        }

        // upsert device
        const id = await this.device.save({
            device_id: deviceId,
            version,
            os
        });

        // const device = (await this.device.get(
        //     ['user_id', 'created_at'],
        //     [['id', '=', id]]
        // ))[0];

        const device = this.device.getByDeviceId(deviceId);

        this.logger.info(TAG, `Device info: ${JSON.stringify(device)}`);

        if (this.signinRequired(device)) {
            //throw new Error('signin required');
            throw new SigninRequiredError();
        }

        // resolve db identifier
        const user = this.sm.getUser() ?? {};
        const userEmail = user.email ?? User.GUEST_EMAIL;

        return {
            db: userEmail === User.GUEST_EMAIL ? deviceId : userEmail
        };
    }
}
