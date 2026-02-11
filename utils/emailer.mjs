import nodemailer from 'nodemailer';

export default class Emailer {
    constructor(logger, config) {
        this.logger = logger;

        /*
         * config example:
         * {
         *   host,
         *   port,
         *   secure,
         *   user,
         *   pass,
         *   from
         * }
         */
        this.transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.pass
            }
        });

        this.from = config.from;
    }

    async send(to, cc = [], subject, html) {
        this.logger.info('emailer', `Sending email to ${to}`);

        await this.transporter.sendMail({
            from: this.from,
            to,
            cc,
            subject,
            html
        });
    }
}

