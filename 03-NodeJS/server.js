'use strict';

require('dotenv').config();

const path = require('node:path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const { csrfSync } = require('csrf-sync');
const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const { UserStore } = require('./services/userStore');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const defaultDevelopmentSecret = 'railgo-local-demo-secret-change-before-deployment';
const sessionSecret = process.env.SESSION_SECRET;

if (process.env.NODE_ENV === 'production' && (!sessionSecret || sessionSecret === defaultDevelopmentSecret)) {
    throw new Error('Set a strong SESSION_SECRET in the production environment.');
}

if (!sessionSecret && process.env.NODE_ENV !== 'production') {
    console.warn('RailGo demo: using a development-only session secret. Configure SESSION_SECRET in .env for local use.');
}

function createApp(options = {}) {
    const app = express();
    const userStore = options.userStore || new UserStore();
    const { generateToken, csrfSynchronisedProtection } = csrfSync({
        getTokenFromRequest: (req) => req.body && req.body._csrf
    });

    app.disable('x-powered-by');
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.locals.asset = (file) => `/assets/${file.replace(/^\/+/, '')}`;
    app.locals.userStore = userStore;

    app.use(helmet());
    app.use(express.urlencoded({ extended: false, limit: '20kb' }));
    app.use('/assets', express.static(path.join(__dirname, 'public'), {
        index: false,
        maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0
    }));
    app.use(session({
        name: 'railgo.sid',
        secret: options.sessionSecret || sessionSecret || defaultDevelopmentSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 2
        }
    }));
    app.use((req, res, next) => {
        res.locals.csrfToken = generateToken(req);
        res.locals.currentUser = req.session.user || null;
        res.locals.flash = req.session.flash || null;
        delete req.session.flash;
        next();
    });
    app.use(csrfSynchronisedProtection);

    app.use('/', homeRoutes);
    app.use('/', authRoutes);
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

if (require.main === module) {
    const app = createApp();
    const port = Number.parseInt(process.env.PORT || '3000', 10);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('PORT must be a valid port number between 1 and 65535.');
    }
    app.listen(port, () => {
        console.log(`RailGo Node.js demo listening at http://localhost:${port}`);
    });
}

module.exports = { createApp };
