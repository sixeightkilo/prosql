export default class SessionManager {
    constructor(logger) {
        this.logger = logger;
        this.req = null;
    }

    init(req) {
        this.req = req;
    }

    get(key) {
        return this.req.session[key];
    }

    set(key, value) {
        this.req.session[key] = value;
    }

    destroy() {
        this.req.session.destroy();
    }

    getUser() {
        return this.req.session.user ?? null;
    }

    setUser(user) {
        this.req.session.user = user;
    }

    getDevice() {
        return this.req.session.device ?? null;
    }

    setOtp(otp) {
        this.req.session.otp = otp;
    }

    getOtp() {
        return this.req.session.otp ?? null;
    }

    setTempUser(user) {
        this.req.session.tempUser = user;
    }

    getTempUser() {
        return this.req.session.tempUser ?? null;
    }   

    setDevice(device) {
        this.req.session.device = device;
    }

    setDeviceId(id) {
        this.req.session.deviceId = id;
    }

    getDeviceId() {
        return this.req.session.deviceId;
    }

    setVersion(v) {
        this.req.session.version = v;
    }

    getVersion(v) {
        return this.req.session.version;
    }

    setOs(o) {
        this.req.session.os = o;
    }

    setCaptcha(captcha) {
        this.req.session.captcha = captcha;
    }

    getCaptcha() {
        return this.req.session.captcha ?? null;
    }   

    dump() {
        return `${this.req.session.deviceId}:${this.req.session.version}:${JSON.stringify(this.req.session.user)}`;
    }

    write() {
        // PHP: session_write_close()
        // Node: sessions are non-blocking
        // We keep this for API parity

        if (typeof this.req.session.save === 'function') {
            this.req.session.save(() => {});
        }
    }

    kill() {
        if (this.req?.session) {
            this.req.session.destroy(() => {});
        }
    }
}

