export default class Validator {
    static NOT_EMPTY = 'NOT_EMPTY';
    static IS_EMAIL = 'IS_EMAIL';

    static validate(defs) {
        for (const def of defs) {
            const { field, alias, rules } = def;

            for (const rule of rules) {
                switch (rule) {
                    case Validator.NOT_EMPTY:
                        if (field === undefined || field === null || String(field).trim() === '') {
                            throw new Error(`${alias} cannot be empty`);
                        }
                        break;

                    case Validator.IS_EMAIL:
                        if (!Validator.isEmail(field)) {
                            throw new Error(`Invalid ${alias}`);
                        }
                        break;

                    default:
                        throw new Error(`Unknown validation rule: ${rule}`);
                }
            }
        }
    }

    static isEmail(value) {
        if (!value) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
}

