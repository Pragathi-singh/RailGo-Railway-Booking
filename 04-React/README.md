# RailGo React Edition

## Stack

React, Vite, JavaScript, and a Node REST API backend.

## Prerequisites

- Node.js 20+
- npm
- A running Node edition at the configured API URL

## Setup

```powershell
cd 04-React
npm install
Copy-Item .env.example .env.local
npm run dev
```

`VITE_API_BASE_URL` must point to the Node API, for example
`http://127.0.0.1:3011`.

Default development port: `http://localhost:5173`.

```powershell
npm run build
npm run preview
```

React uses session-backed API authentication and database-backed booking
operations; it does not access MySQL directly. Demo payment collects no real
payment credentials.
