/*
 * Port of:
 * Prosql\Middleware\SessionAuthMiddleware
 */

export default class SessionAuthMiddleware {
    constructor(logger) {
        this.logger = logger;
    }

    /*
     * Express middleware signature
     */
    handle = (req, res, next) => {
        const path = req.path;
        this.logger.debug(`Path: ${path}`);

        // signout
        if (path === '/signout') {
            req.sm.kill();
            res.redirect(302, '/connections');
            return;
        }

        // publicly accessible paths
        const openPaths = [
            '/',
            '/signin',
            '/signup',
            '/read-more',
            '/install',
            '/connections',
            '/connections-faq'
        ];

        if (openPaths.includes(path)) {
            req.sm.write();
            next();
            return;
        }

        const email = req.sm.getUser()?.email ?? null;
        this.logger.debug(`email: ${email}`);

        if (email) {
            // logged in (guest or real user)
            req.sm.write();
            next();
            return;
        }

        // force signin
        res.redirect(302, '/connections');
    };
}

