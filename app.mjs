import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import 'dotenv/config';


import logger from './logger.mjs';
import SessionManager from './session/session-manager.mjs';

// controllers
import WorkerDevicesController from './controllers/worker-devices.mjs';
import UIDevicesController from './controllers/ui-devices.mjs';
// import LoginController from './controllers/login.mjs';
// import SqlController from './controllers/sql.mjs';
// import Renderer from './controllers/renderer.mjs';

// middleware
import SessionAuthMiddleware from './middleware/session-auth.mjs';
import SqliteDB from './db/sqlite.mjs';
import Device from './models/device.mjs';
import User from './models/user.mjs';

const db = new SqliteDB(process.env.DB_PATH, logger);
const deviceModel = new Device(logger, db);
const userModel = new User(logger, db);


// force UTC (same as PHP)
process.env.TZ = 'UTC';

const app = express();

/* -------------------------
 * middleware
 * ------------------------- */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    name: 'PHPSESSID',          // keep for parity
    secret: 'prosql-secret',   // move to config later
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// attach SessionManager per request
app.use((req, res, next) => {
    req.sm = new SessionManager(logger);
    req.sm.init(req);
    next();
});

app.use((req, res, next) => {
    req.container = {
        workerDevicesController: new WorkerDevicesController(
            logger,
            req.sm,
            deviceModel
        ),
        // later:
        // loginController, uiDevicesController, etc.
    };
    next();
});


app.use((req, res, next) => {
    req.container = {
        ...req.container,
        uiDevicesController: new UIDevicesController(
            logger,
            req.sm,
            deviceModel
        )
    };
    next();
});
/* -------------------------
 * routes (1:1 with Slim)
 * ------------------------- */

// worker
app.post(
    '/worker-api/devices/:action',
    WorkerDevicesController.handle
);

// browser devices
app.post(
    '/browser-api/devices/:action',
    UIDevicesController.handle
);

// login
// app.all(
//     '/browser-api/login/:action',
//     LoginController.handle
// );

// sql formatter (session protected)
// app.post(
//     '/browser-api/sql/:action',
//     SessionAuthMiddleware.handle,
//     SqlController.handle
// );

// renderer (catch-all, session protected)
// app.get(
//     '*',
//     SessionAuthMiddleware.handle,
//     Renderer.handle
// );

/* -------------------------
 * error handling
 * ------------------------- */

app.use((err, req, res, next) => {
    logger.error('Unhandled error', {
        message: err.message,
        stack: err.stack
    });

    res.status(500).json({
        error: 'internal-server-error'
    });
});

/* -------------------------
 * startup
 * ------------------------- */

const PORT = process.env.PORT ?? 5001;

app.listen(PORT, () => {
    logger.info(`Prosql Node backend listening on ${PORT}`);
});

