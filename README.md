# ProSQL

ProSQL is a self-hosted MySQL client that runs in the browser and executes queries locally through a lightweight desktop agent.

## Components

- Node.js backend (Express + SQLite)
- Go-based local agent
- Browser frontend

## Architecture

```
Browser <----> Local Agent (Go)
Browser -----> Backend (Node + SQLite)
```

- The browser communicates directly with the local agent (two-way).
- The browser communicates with the backend for authentication, sync, and storage.
- The backend does **not** execute user database queries.
- The agent only accepts requests from the configured domain.
- All timestamps are stored in UTC.
- SQLite runs in WAL mode.
- Migrations are handled via Umzug.

## Requirements

- Node.js 18 or higher
- Go 1.20 or higher
- nginx
- SSL certificate and key
- Linux, macOS, or Windows environment for building the agent

## Installation

### 1. Clone the repository

```bash
git clone git@github.com:kargirwar/prosql
cd prosql
npm install
```

### 2. Run setup

```bash
npm run setup
```

The setup script will:

- Generate `.env`
- Run database migrations
- Build agent binaries (mac / linux / windows)
- Generate nginx configuration

Generated files:

```
deploy/dist/nginx.conf
deploy/dist/agent-mac
deploy/dist/agent-linux
deploy/dist/agent-windows.exe
.env
```

### 3. Configure nginx

Copy the generated config:

```bash
sudo cp deploy/dist/nginx.conf /etc/nginx/sites-available/prosql.conf
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/prosql.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Ensure your SSL certificate paths are correct.

### 4. Start the backend

```bash
node app.mjs
```

Or use a process manager such as `systemd` or `pm2`.

### 5. Run the agent (on client machine)

Copy the correct binary from `deploy/dist`.

**Linux:**

```bash
chmod +x agent-linux
./agent-linux
```

**macOS:**

```bash
chmod +x agent-mac
./agent-mac
```

If macOS blocks execution, allow it in: System Settings → Privacy & Security

**Windows:**

```
agent-windows.exe
```

Once the agent is running, refresh the browser.

## Environment Variables

Generated automatically during setup:

```env
PORT=5001
DB_PATH=./data
SESSION_SECRET=<randomly generated>
SMTP_HOST=<host>
SMTP_PORT=<port>
SMTP_USER=<user>
SMTP_PASS=<password>
SMTP_FROM="ProSQL <email>"
```

You may edit `.env` after setup if needed.

## Database

- SQLite via `better-sqlite3`
- WAL mode enabled
- Foreign keys enforced
- All timestamps stored in UTC (ISO-8601 format)

To run migrations manually:

```bash
node migrate.mjs up
```

## Production Notes

- Use a process manager (`systemd` recommended).
- Back up the SQLite database regularly.
- Keep SSL certificates updated.
- Ensure nginx is properly configured.
- Do not expose the backend without HTTPS.

## License

MIT
