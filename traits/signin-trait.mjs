import Device from '../models/device.mjs';
import User from '../models/user.mjs';

export default class SigninTrait {
    constructor(logger, sessionManager) {
        this.logger = logger;
        this.sm = sessionManager;
    }

    signinRequired(device) {
        /*
         * PHP:
         * $registeredAt = DateTime::createFromFormat(Device::TIMESTAMP_FORMAT, $device['created_at']);
         * $now = new DateTime;
         * $days = $now->diff($registeredAt)->format("%a");
         */

        const registeredAt = this.parseTimestamp(
            device.created_at,
            Device.TIMESTAMP_FORMAT
        );

        const now = new Date();
        const days = Math.floor(
            (now.getTime() - registeredAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        /*
         * PHP:
         * $userEmail = $this->sm->getUser()['email'] ?? '';
         */
        const user = this.sm.getUser();
        const userEmail = user?.email ?? '';

        let signinRequired = false;

        if (days > User.MAX_GUEST_DAYS) {
            if (!userEmail) {
                signinRequired = true;
            }

            // logged in as guest, must sign in
            if (userEmail === User.GUEST_EMAIL) {
                signinRequired = true;
            }
        } else {
            // signed in and then got logged out
            // user_id will have a valid value only if the user has signed up
            if (device.user_id && !userEmail) {
                signinRequired = true;
            }

            // todo: why do we reach here?
            if (device.user_id && userEmail === User.GUEST_EMAIL) {
                signinRequired = true;
            }
        }

        this.logger.info(
            `user_id: ${device.user_id} user: ${userEmail} days: ${days} signin-required ${Number(signinRequired)}`
        );

        return signinRequired;
    }

    /*
     * Helper to mimic PHP DateTime::createFromFormat
     * We do NOT get clever here.
     */
    parseTimestamp(value, format) {
        // Assuming TIMESTAMP_FORMAT is something like 'Y-m-d H:i:s'
        // Backend DB already stores UTC timestamps
        // JS Date parses this reliably if we append 'Z'

        // If your format is different, adjust here ONLY.
        return new Date(`${value}Z`);
    }
}

