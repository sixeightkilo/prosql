import express from 'express';
// import session from 'express-session';
import multer from 'multer';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getRequestId } from './context.mjs';
import config from './config/config.mjs';
import SigninRequiredError from './errors/signin-required-error.mjs';

import Logger from 'node-logger';
import SessionManager from './session/session-manager.mjs';

// controllers
import WorkerDevicesController from './controllers/worker-devices.mjs';
import UIDevicesController from './controllers/ui-devices.mjs';
import LoginController from './controllers/login.mjs';
// import SqlController from './controllers/sql.mjs';
import Renderer from './controllers/renderer.mjs';

// middleware
import SessionAuthMiddleware from './middleware/session-auth.mjs';
import SqliteDB from './db/sqlite.mjs';
import Device from './models/device.mjs';
import User from './models/user.mjs';
import Emailer from './utils/emailer.mjs';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import WorkerSqliteConnections from './controllers/worker-sqlite-connections.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logger = setupLogger();
const db = new SqliteDB({
    dir: process.env.DB_PATH,
    file: 'data.db',
}, logger);

const deviceModel = new Device(logger, db);
const userModel = new User(logger, db);

function setupLogger() {
    const logDir = join(__dirname, 'logs');
    const logFile = 'app.log';

    return new Logger(logDir, logFile, getRequestId);
}


const emailer = new Emailer(logger, {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM
});


// force UTC (same as PHP)
process.env.TZ = 'UTC';

const app = express();

/* -------------------------
 * middleware
 * ------------------------- */
const sessionAuth = new SessionAuthMiddleware(logger);

const upload = multer();

app.use(express.json());                 // handles application/json
app.use(express.urlencoded({ extended: false })); // handles application/x-www-form-urlencoded
app.use(upload.none());

const SQLiteStore = SQLiteStoreFactory(session);

app.use(session({
    name: 'PHPSESSID',
    secret: process.env.SESSION_SECRET || 'prosql-secret',
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: process.env.DB_PATH,
        concurrentDB: true
    }),
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

app.use(
    express.static(
        path.join(__dirname, 'public')
    )
);

app.use((req, res, next) => {
    req.container = {
        workerDevicesController: new WorkerDevicesController(
            logger,
            req.sm,
            deviceModel
        ),
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

app.use((req, res, next) => {
    req.container = {
        ...req.container,
        loginController: new LoginController(logger, req.sm)
            .setUser(userModel)
            .setDevice(deviceModel)
            .setEmailer(emailer)
            .setDownloadPath(process.env.DOWNLOAD_PATH)
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
app.all(
    '/browser-api/login/:action',
    LoginController.handle
);

// sql formatter (session protected)
// app.post(
//     '/browser-api/sql/:action',
//     SessionAuthMiddleware.handle,
//     SqlController.handle
// );

// connections


const workerSqliteConnections =
    new WorkerSqliteConnections(logger, db);

app.get(
    '/worker-api/sqlite/connections/:path?',
    workerSqliteConnections.handle
);

app.post(
    '/worker-api/sqlite/connections',
    workerSqliteConnections.handle
);

app.delete(
    '/worker-api/sqlite/connections',
    workerSqliteConnections.handle
);


app.get('*', sessionAuth.handle, (req, res, next) => {
    const renderer = new Renderer(logger, req.sm, config);
    renderer.handle(req, res, next);
});

/* -------------------------
 * error handling
 * ------------------------- */

app.use((err, req, res, next) => {

    logger.info('app', {
        message: err.message,
        stack: err.stack
    });

    if (err instanceof SigninRequiredError) {
        return res.status(401).json({
            status: 'error',
            msg: 'signin-required'
        });
    }

    if (err.status) {
        return res.status(err.status).json({ status: 'error', msg: err.message });
    }

    res.status(500).json({ error: 'internal-server-error' });
});

/* -------------------------
 * startup
 * ------------------------- */

const PORT = process.env.PORT ?? 5001;

app.listen(PORT, () => {
    logger.info('app', `Prosql Node backend listening on ${PORT}`);
});

