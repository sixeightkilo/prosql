export default {
    env: process.env.NODE_ENV ?? 'dev',

    // current agent version fallback
    version: '0.6.4',

    // per-build versions (used for cache busting in prod)
    'build-0.6': {
        version: 36
    },

    // paths (if needed later)
    downloadPath: '/downloads'
};

