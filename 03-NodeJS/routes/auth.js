'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const { validationResult } = require('express-validator');
const { redirectIfAuthenticated } = require('../middleware/auth');
const { loginValidation, signupValidation } = require('../utils/validation');

const router = express.Router();
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: 'Too many login attempts. Please wait a few minutes and try again.'
});
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 8,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: 'Too many signup attempts. Please wait before trying again.'
});

router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('login', { title: 'Login', values: {}, errors: {} });
});

router.post('/login', redirectIfAuthenticated, loginLimiter, loginValidation, async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errors = {};
        for (const error of result.array()) {
            if (!errors[error.path]) errors[error.path] = error.msg;
        }
        return res.status(422).render('login', {
            title: 'Login',
            values: { email: req.body.email },
            errors
        });
    }

    try {
        const user = await req.app.locals.userStore.authenticate(req.body.email, req.body.password);
        if (!user) {
            return res.status(401).render('login', {
                title: 'Login',
                values: { email: req.body.email },
                errors: { form: 'We could not log you in with those details. Check them and try again.' }
            });
        }

        return req.session.regenerate((error) => {
            if (error) return next(error);
            req.session.user = user;
            req.session.flash = { type: 'success', message: 'Welcome back to RailGo.' };
            req.session.save((saveError) => {
                if (saveError) return next(saveError);
                return res.redirect('/dashboard');
            });
        });
    } catch (error) {
        return next(error);
    }
});

router.get('/signup', redirectIfAuthenticated, (req, res) => {
    res.render('signup', { title: 'Create account', values: {}, errors: {} });
});

router.post('/signup', redirectIfAuthenticated, signupLimiter, signupValidation, async (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errors = {};
        for (const error of result.array()) {
            if (!errors[error.path]) errors[error.path] = error.msg;
        }
        return res.status(422).render('signup', {
            title: 'Create account',
            values: {
                fullName: req.body.fullName,
                email: req.body.email,
                mobile: req.body.mobile,
                termsAccepted: req.body.terms === 'yes'
            },
            errors
        });
    }

    try {
        const created = await req.app.locals.userStore.create({
            fullName: req.body.fullName,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password
        });
        if (!created) {
            return res.status(409).render('signup', {
                title: 'Create account',
                values: {
                    fullName: req.body.fullName,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    termsAccepted: true
                },
                errors: { email: 'An account with this email already exists. Try logging in.' }
            });
        }

        req.session.flash = { type: 'success', message: 'Your demo account is ready. Please log in.' };
        return req.session.save((error) => {
            if (error) return next(error);
            return res.redirect('/login');
        });
    } catch (error) {
        return next(error);
    }
});

router.post('/logout', (req, res, next) => {
    req.session.destroy((error) => {
        if (error) return next(error);
        res.clearCookie('railgo.sid', {
            httpOnly: true,
            sameSite: 'lax',
            secure: req.app.get('env') === 'production'
        });
        return res.redirect('/home?loggedOut=1');
    });
});

module.exports = router;
