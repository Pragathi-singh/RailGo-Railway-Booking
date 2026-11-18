# RailGo Node.js Edition

## Stack

Node.js 20+, Express, EJS, sessions, mysql2, and MySQL 8.

## Prerequisites

- Node.js 20.11+
- npm
- MySQL 8

## Setup

```powershell
cd 03-NodeJS
npm install
Copy-Item .env.example .env
```

Set `RAILGO_USE_MYSQL=1`, the dedicated `railgo_node` database variables, and
a long `SESSION_SECRET` in the ignored `.env` file. The server creates required
tables and demo schedules during startup.

```powershell
npm start
```

Default local port: `http://localhost:3000`.

The `/api` routes provide authentication, profile, search, booking, history
and cancellation operations for API clients.
