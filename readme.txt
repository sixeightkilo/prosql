ProSQL

ProSQL is a self-hosted MySQL client that runs in the browser and executes queries locally through a lightweight desktop agent.

It consists of:

Node.js backend (Express + SQLite)

Go-based local agent

Browser frontend

Architecture

Browser <----> Local Agent (Go)
Browser -----> Backend (Node + SQLite)

The browser communicates directly with the local agent (two-way).
The browser communicates with the backend for authentication, sync, and storage.
The backend does NOT execute user database queries.
The agent only accepts requests from the configured domain.
All timestamps are stored in UTC.
SQLite runs in WAL mode.
Migrations are handled via Umzug.

Requirements

Node.js version 18 or higher

Go version 1.20 or higher

nginx

SSL certificate and key

Linux, macOS, or Windows environment for building the agent

Installation

Clone the repository

git clone git@github.com:kargirwar/prosql
cd prosql
npm install

Run setup

npm run setup

The setup script will:

Generate .env

Run database migrations

Build agent binaries (mac / linux / windows)

Generate nginx configuration

Generated files:

deploy/dist/nginx.conf
deploy/dist/agent-mac
deploy/dist/agent-linux
deploy/dist/agent-windows.exe
.env

Configure nginx

Copy the generated config:

sudo cp deploy/dist/nginx.conf /etc/nginx/sites-available/prosql.conf

Enable it:

sudo ln -s /etc/nginx/sites-available/prosql.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

Ensure your SSL certificate paths are correct.

Start Backend

node app.mjs

Or use a process manager such as systemd or pm2.

Run the Agent (On Client Machine)

Copy the correct binary from deploy/dist.

Linux:

chmod +x agent-linux
./agent-linux

macOS:

chmod +x agent-mac
./agent-mac

If macOS blocks execution, allow it in:
System Settings → Privacy & Security

Windows:

agent-windows.exe

Once the agent is running, refresh the browser.

Environment Variables

Generated automatically during setup:

PORT=5001
DB_PATH=./data

SESSION_SECRET=<randomly generated>

SMTP_HOST=<host>
SMTP_PORT=<port>
SMTP_USER=<user>
SMTP_PASS=<password>
SMTP_FROM="ProSQL <email>"

You may edit .env after setup if needed.

Database

SQLite (better-sqlite3)

WAL mode enabled

Foreign keys enforced

All timestamps stored in UTC (ISO-8601 format)

You can run migrations manually if needed:

node migrate.mjs up

Production Notes

Use a process manager (systemd recommended).

Back up the SQLite database regularly.

Keep SSL certificates updated.

Ensure nginx is properly configured.

Do not expose the backend without HTTPS.

License

MIT
