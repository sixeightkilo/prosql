import pug from 'pug';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Renderer {
    constructor(logger, sessionManager, config) {
        this.logger = logger;
        this.sm = sessionManager;
        this.configRaw = config;

        // determine agent version
        let agentVersion = this.sm.getVersion();
        if (!agentVersion) {
            agentVersion = config.version;
        }

        // strip minor version: x.y.z → x.y
        const parts = agentVersion.split('.');
        const root = `build-${parts[0]}.${parts[1]}`;

        let appVersion;
        if (config.env === 'dev') {
            appVersion = Math.floor(Math.random() * 10000);
        } else {
            appVersion = config[root].version;
        }

        this.renderConfig = {
            root,
            version: appVersion
        };

        this.templatesPath = path.join(
            __dirname,
            '..',
            'public',
            root,
            'templates'
        );
    }

    /* -------------------------
     * entrypoint
     * ------------------------- */

    handle = (req, res, next) => {
        try {
            const params = req.path.split('/').filter(Boolean);

            switch (params[0] ?? '') {
                case '':
                    this.render(res, 'index.pug');
                    return;

                case 'connections':
                    this.renderConnections(res);
                    return;

                case 'connections-faq':
                case 'read-more':
                case 'signup':
                case 'signin':
                case 'install':
                    this.render(res, `${params[0]}.pug`);
                    return;

                case 'app':
                    this.renderApp(res, params[1]);
                    return;

                default:
                    res.status(404).end();
                    return;
            }
        } catch (err) {
            next(err);
        }
    };

    /* -------------------------
     * helpers
     * ------------------------- */

    renderConnections(res) {
        const email = this.sm.getUser()?.email ?? null;

        const file = email
            ? 'connections-user.pug'
            : 'connections.pug';

        this.render(res, file);
    }

    render(res, file) {
        const filepath = path.join(this.templatesPath, file);
        const html = pug.renderFile(filepath, this.renderConfig);
        res.status(200).send(html);
    }

    renderApp(res, appPath) {
        const email = this.sm.getUser()?.email ?? null;
        this.logger.debug(`email: ${email}`);

        const allowed = ['tables', 'queries', 'help', 'about'];
        if (!allowed.includes(appPath)) {
            res.status(404).end();
            return;
        }

        const filepath = path.join(this.templatesPath, `${appPath}.pug`);
        const html = pug.renderFile(filepath, this.renderConfig);
        res.status(200).send(html);
    }
}

