'use strict';

const express = require('express');
const { validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { requireAuth } = require('../middleware/auth');
const { searchValidation } = require('../utils/validation');

const router = express.Router();
const searchLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: 'Please wait a moment before submitting another demo search.'
});

router.get('/', (req, res) => res.redirect('/home'));

router.get('/home', (req, res) => {
    res.render('home', {
        title: 'Plan your journey',
        search: null,
        errors: {},
        searchMessage: null,
        flash: req.query.loggedOut === '1'
            ? { type: 'success', message: 'You have been logged out.' }
            : res.locals.flash
    });
});

router.post('/search', searchLimiter, searchValidation, (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errors = {};
        for (const error of result.array()) {
            if (!errors[error.path]) errors[error.path] = error.msg;
        }
        return res.status(422).render('home', {
            title: 'Plan your journey',
            search: req.body,
            errors,
            searchMessage: null
        });
    }

    return res.render('home', {
        title: 'Plan your journey',
        search: req.body,
        errors: {},
        searchMessage: 'Demo search only: live train availability is not connected, so no train results are shown.'
    });
});

router.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard', { title: 'My RailGo' });
});

module.exports = router;
