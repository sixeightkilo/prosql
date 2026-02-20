import fs from 'fs'
import path from 'path'
import readline from 'readline/promises'
import { execSync } from 'child_process'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DIST_DIR = path.join(__dirname, 'dist')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function ask(question, def = '') {
    const suffix = def ? ` (${def})` : ''
    return rl.question(`${question}${suffix}: `)
        .then(answer => answer.trim() || def)
}

function generateSecret() {
    return crypto.randomBytes(32).toString('hex')
}

function ensureDist() {
    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR, { recursive: true })
    }
}

function generateNginx(domain, sslCert, sslKey, port) {
    const template = `
server {
    if ($host = {{DOMAIN}}) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name {{DOMAIN}};
    return 301 https://{{DOMAIN}};
}

server {
    listen 443 ssl;
    server_name {{DOMAIN}};
    error_log /var/www/{{DOMAIN}}/logs/error.log;
    access_log /var/www/{{DOMAIN}}/logs/access.log;

    expires $expires;

    ssl_certificate {{SSL_CERT}};
    ssl_certificate_key {{SSL_KEY}};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location = /favicon.ico {
        return 204;
        access_log off;
        log_not_found off;
    }

    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:{{PORT}};
    }
}
`

    const final = template
        .replaceAll('{{DOMAIN}}', domain)
        .replace('{{SSL_CERT}}', sslCert)
        .replace('{{SSL_KEY}}', sslKey)
        .replace('{{PORT}}', port)

    fs.writeFileSync(path.join(DIST_DIR, 'nginx.conf'), final)
}

function runMigrations() {
    console.log('Running migrations...')
    execSync('node migrate.mjs up', {
        stdio: 'inherit'
    })
}

function generateEnv(port, dbPath, smtp, sessionSecret) {
    const envContent = `
PORT=${port}
DB_PATH=${dbPath}

SESSION_SECRET=${sessionSecret}

SMTP_HOST=${smtp.host}
SMTP_PORT=${smtp.port}
SMTP_USER=${smtp.user}
SMTP_PASS=${smtp.pass}
SMTP_FROM="${smtp.from}"
`

    fs.writeFileSync(path.join(process.cwd(), '.env'), envContent.trim())
}

function findGoBinary() {
    try {
        execSync('go version', { stdio: 'ignore' })
        return 'go'
    } catch {}

    const fallback = '/usr/local/go/bin/go'
    if (fs.existsSync(fallback)) return fallback

    throw new Error(
        'Go not found.\n' +
        'Install Go and ensure it is in PATH.\n' +
        'https://go.dev/dl/'
    )
}

function buildAgent(domain, version) {
    console.log('Building agents...')

    const agentDir = path.join(process.cwd(), 'agent')

    if (!fs.existsSync(agentDir)) {
        throw new Error('/agent directory not found')
    }

    const builds = [
        { os: 'mac', out: 'agent-mac' },
        { os: 'linux', out: 'agent-linux' },
        { os: 'windows', out: 'agent-windows.exe' }
    ]

    builds.forEach(({ os, out }) => {
        const gobin = findGoBinary()
        const cmd = `
${gobin} build -ldflags="-X 'main.VERSION=${version}' -X 'main.ALLOW=https://${domain}' -X 'main.OS=${os}'" -o ${path.join(DIST_DIR, out)}`

        execSync(cmd, {
            cwd: agentDir,
            stdio: 'inherit'
        })
    })
}


async function main() {
    ensureDist()

    console.log('\n=== ProSQL Setup ===\n')

    const domain = await ask('Enter your domain (without https)')
    const sslCert = await ask('Path to SSL certificate (.pem)')
    const sslKey = await ask('Path to SSL private key (.key)')
    const port = await ask('Backend port', '5001')
    const dbPath = await ask('Database dir', './data')

    console.log('\n--- SMTP Configuration ---')
    const smtpHost = await ask('SMTP host')
    const smtpPort = await ask('SMTP port', '587')
    const smtpUser = await ask('SMTP user')
    const smtpPass = await ask('SMTP password')
    const smtpFrom = await ask('SMTP from (e.g. ProSQL <email@example.com>)')

    const sessionSecret = generateSecret()

    generateNginx(domain, sslCert, sslKey, port)

    generateEnv(
        port,
        dbPath,
        {
            host: smtpHost,
            port: smtpPort,
            user: smtpUser,
            pass: smtpPass,
            from: smtpFrom
        },
        sessionSecret
    )

    runMigrations()

    buildAgent(domain, '0.6.4')

    console.log('\n✔ Setup complete.\n')
    console.log('Files generated:')
    console.log(' - deploy/dist/nginx.conf')
    console.log(' - deploy/dist/agent-mac')
    console.log(' - deploy/dist/agent-linux')
    console.log(' - deploy/dist/agent-windows.exe')
    console.log(' - .env\n')

    console.log('Next steps:')
    console.log('1. Copy nginx.conf to /etc/nginx/sites-available/')
    console.log('2. Enable the site and reload nginx')
    console.log('3. Run migrations and start backend')
    console.log('4. Use correct agent binary on client machine\n')

    rl.close()
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
