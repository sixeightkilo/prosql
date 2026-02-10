export default class SessionAuthMiddleware {
    static handle(req, res, next) {
        const device = req.sm.getDevice();

        if (!device) {
            return res.status(401).json({ error: 'no-device' });
        }

        // port PHP logic here later, verbatim
        next();
    }
}

