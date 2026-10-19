'use strict';

function requireAuth(req, res, next) {
    if (!req.session.user) {
        req.session.flash = { type: 'error', message: 'Your session has expired or you need to log in first.' };
        return req.session.save((error) => {
            if (error) return next(error);
            res.redirect('/login');
        });
    }
    return next();
}

function redirectIfAuthenticated(req, res, next) {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    return next();
}

module.exports = { requireAuth, redirectIfAuthenticated };
