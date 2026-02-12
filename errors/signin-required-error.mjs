import AppError from './app-error.mjs';

export default class SigninRequiredError extends AppError {
    constructor() {
        super('signin-required', 302);
    }
}

