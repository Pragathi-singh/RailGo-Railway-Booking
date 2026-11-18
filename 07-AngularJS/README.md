# RailGo AngularJS Edition

## Stack

AngularJS 1.8, Angular Route, HTML, CSS, JavaScript, and a Node REST API.

## Setup

```powershell
cd 07-AngularJS
npm install
Copy-Item .env.example .env
npm test
npm start
```

Set `RAILGO_API_BASE_URL` for the Node API. Default static URL:
`http://localhost:4174`.

AngularJS uses API services for authentication, profile, search, booking,
history and cancellation. It never accesses MySQL directly.
