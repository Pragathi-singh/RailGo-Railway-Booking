# RailGo AngularJS Edition

RailGo is a standalone railway journey-planning interface built with the original
AngularJS 1.8 framework, AngularJS Route, HTML5, CSS3 and a small local HTTP server.
It provides the same polished RailGo experience as the other repository editions
without replacing them.

## Run locally

Prerequisites: Node.js 18+ and npm.

```powershell
cd 07-AngularJS
npm install
npm test
npm start
```

Open <http://localhost:4174/>. The application uses hash routing, so routes include
`#/`, `#/search`, `#/login`, `#/signup`, `#/dashboard`, `#/history`, and `#/profile`.

## Features

- Responsive RailGo home page with station search, class selection and station swap.
- Search validation for required stations and identical origin/destination.
- Honest result state when live railway inventory is unavailable.
- Signup, sign-in, logout, password guidance and protected account routes.
- Browser-local profile persistence, dashboard, profile and booking-history empty state.
- Accessible labels, keyboard-friendly controls, validation feedback and custom 404 page.

## Important limitation

This is a frontend-only AngularJS edition. Account records are stored in
`localStorage` for local development and passwords are reduced to a browser-side
hash for this demonstration; this is not production authentication or secure
credential storage. There is no backend, live railway provider, booking, payment,
fare, seat, PNR or availability integration. Do not use this implementation for
real accounts or travel transactions.
