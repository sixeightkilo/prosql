import cls from 'cls-hooked';
const namespace = cls.createNamespace('request');
//import uuid from 'uuid';

function generateShortId(length) {
    return Math.random().toString(36).substring(2, 2 + length);
}

function attachRequestId(req, res, next) {
    //const requestId = uuid.v4();
    const requestId = generateShortId(6);
    namespace.run(() => {
        namespace.set('requestId', requestId);
        next();
    });
}

function getRequestId() {
    return namespace.get('requestId');
}

export { attachRequestId, getRequestId };

