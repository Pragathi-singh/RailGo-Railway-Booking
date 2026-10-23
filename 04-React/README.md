# RailGo React demo

This is a standalone React + Vite implementation of the RailGo railway booking experience. It is a front-end demo only: it does not connect to live train data, book tickets, process payments, or call a backend.

## Run locally

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

## Demo authentication

Accounts are stored in the browser's `localStorage`, and passwords are hashed with `bcryptjs` before storage. This is useful for demonstrating the UI flow, but browser-only authentication is **not production-secure**. Clear site storage to remove demo accounts. Never use this approach for real credentials, tickets, or payments.
