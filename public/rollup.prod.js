import { terser } from "rollup-plugin-terser";
export default [
    {
		'input': 'build-0.6/js/install.js',
		'output': {
            'file': 'build-0.6/dist/js/install.js',
            'format': 'iife',
            'plugins': [terser()]
        },
	},
    {
		'input': 'build-0.6/js/index.js',
		'output': {
            'file': 'build-0.6/dist/js/index.js',
            'format': 'iife',
            'plugins': [terser()]
        },
	},
	{
		'input': 'build-0.6/js/connections.js',
		'output': {
            'file': 'build-0.6/dist/js/connections.js',
            'format': 'iife',
            'plugins': [terser()]
        },
	},
    {
		'input': 'build-0.6/js/signup.js',
		'output': {
            'file': 'build-0.6/dist/js/signup.js',
            'format': 'iife',
            'plugins': [terser()]
        },
	},
    {
		'input': 'build-0.6/js/signin.js',
		'output': {
            'file': 'build-0.6/dist/js/signin.js',
            'format': 'iife',
            'plugins': [terser()]
        },
	},
    {
        'input': 'build-0.6/js/tables.js',
        'output': {
            'file': 'build-0.6/dist/js/tables.js',
            'format': 'iife',
            'plugins': [terser()]
        },
    },
    {
        'input': 'build-0.6/js/queries.js',
        'output': {
            'file': 'build-0.6/dist/js/queries.js',
            'format': 'iife',
            'plugins': [terser()]
        },
    },
    {
        'input': 'build-0.6/js/about.js',
        'output': {
            'file': 'build-0.6/dist/js/about.js',
            'format': 'iife',
            'plugins': [terser()]
        },
    },
    {
        'input': 'build-0.6/js/help.js',
        'output': {
            'file': 'build-0.6/dist/js/help.js',
            'format': 'iife',
            'plugins': [terser()]
        },
    },
    {
        'input': 'build-0.6/js/connection-worker.js',
        'output': {
            'file': 'build-0.6/dist/js/connection-worker.js',
            'format': 'iife',
            'plugins': [terser()]
        },
    },
    {
        'input': 'build-0.6/js/query-worker.js',
        'output': {
            'file': 'build-0.6/dist/js/query-worker.js',
            'format': 'iife',
            'plugins': [terser()]
        },
    },
]
