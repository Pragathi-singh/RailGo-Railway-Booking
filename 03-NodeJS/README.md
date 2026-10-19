# RailGo — Node.js Edition

An independent railway booking **demonstration** built with Node.js, Express, EJS, HTML, CSS, and vanilla JavaScript. Signup and login use server-rendered Express routes and sessions. No database, real railway service, payment provider, or external authentication is connected.

## Prerequisites

- Node.js 20.11 or later (Node.js 22 LTS recommended) and npm.
- VS Code is optional; its integrated terminal can run the same PowerShell commands.

## Run on Windows

1. Open the repository in VS Code and open a PowerShell terminal.
2. Change to this project and install its dependencies:

   ```powershell
   Set-Location .\03-NodeJS
   npm install
   ```

3. Create a local environment file from the example and set a random session secret:

   ```powershell
   Copy-Item .env.example .env
   $secret = node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
   (Get-Content .env) -replace '^SESSION_SECRET=.*$', "SESSION_SECRET=$secret" | Set-Content .env
   ```

   `.env` is excluded from Git. Keep it local; production deployments must provide their own strong `SESSION_SECRET` as an environment variable and must use HTTPS.

4. Start the app:

   ```powershell
   npm start
   ```

5. Visit <http://localhost:3000/>. Set `PORT` in `.env` to choose another port. Stop the server with **Ctrl+C**.

For automatic restart during development, run `npm run dev` on Node.js 20.11 or later.

## Routes

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | Redirect to the home page |
| GET | `/home` | RailGo landing page and demo search form |
| POST | `/search` | Validate search and show a clearly labeled demo response |
| GET / POST | `/signup` | Registration form and validated account creation |
| GET / POST | `/login` | Login form and session creation |
| GET | `/dashboard` | Protected account welcome page |
| POST | `/logout` | Destroy the session and sign out |

## Demo storage and security notes

- Accounts exist only in an in-memory collection and disappear when the server restarts. `data/` is reserved for future local demo data; the app does not write user files.
- Passwords are stored in the in-memory store only as salted bcrypt hashes. Signup normalizes email addresses and rejects duplicates.
- The application uses `express-session`, rotates the session after login, uses synchronizer CSRF tokens for state-changing forms, and rate-limits login and signup requests.
- Helmet supplies security headers. The built-in Express session MemoryStore is intended only for this single-process local demo; do not use it for production.
- The development session-secret fallback is intentionally local-only. In production, set `NODE_ENV=production`, provide a strong secret through the environment, use HTTPS, and use a production session store.
- Train search is demonstration-only: it validates the route, date, and class but does not return live trains, availability, bookings, PNR data, or payment functionality.
- Do not enter real personal information or a password reused on another service.

## Checks and troubleshooting

```powershell
npm run check
npm test
```

- If `npm install` reports network or registry errors, check the connection/proxy and retry; this project does not vendor dependencies.
- If `EADDRINUSE` appears, choose another `PORT` in `.env` or stop the other application using port 3000.
- If a submitted form says it could not be verified, reload the form to receive a fresh session and CSRF token.
- If a production-mode startup reports a missing `SESSION_SECRET`, configure a strong secret outside Git before starting.
- When testing duplicate signup, compare emails without case; email comparison is normalized.
