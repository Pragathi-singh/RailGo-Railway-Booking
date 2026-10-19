'use strict';

const { body } = require('express-validator');

const emailField = body('email')
    .isString()
    .withMessage('Enter a valid email address.')
    .bail()
    .trim()
    .customSanitizer((value) => typeof value === 'string' ? value.toLowerCase() : '')
    .isEmail()
    .withMessage('Enter a valid email address.')
    .isLength({ max: 254 })
    .withMessage('Email address must be 254 characters or fewer.');

const signupValidation = [
    body('fullName')
        .isString()
        .withMessage('Enter your name (up to 100 characters).')
        .bail()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Enter your name (up to 100 characters).'),
    emailField,
    body('mobile')
        .isString()
        .withMessage('Enter a valid 10-digit Indian mobile number.')
        .bail()
        .trim()
        .customSanitizer((value) => typeof value === 'string' ? value.replace(/[\s()-]/g, '') : '')
        .matches(/^[6-9][0-9]{9}$/)
        .withMessage('Enter a valid 10-digit Indian mobile number.'),
    body('password')
        .isString()
        .withMessage('Enter a valid password.')
        .bail()
        .isLength({ min: 8, max: 72 })
        .withMessage('Use 8 to 72 characters for your password.')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).+$/)
        .withMessage('Include at least one uppercase letter, one lowercase letter, and one number.')
        .custom((value) => Buffer.byteLength(value, 'utf8') <= 72)
        .withMessage('Password must be 72 bytes or fewer.'),
    body('confirmPassword')
        .isString()
        .withMessage('Your passwords do not match.')
        .bail()
        .custom((value, { req }) => typeof value === 'string' && value === req.body.password)
        .withMessage('Your passwords do not match.'),
    body('terms')
        .equals('yes')
        .withMessage('Please accept the demo terms to create an account.')
];

const loginValidation = [
    emailField,
    body('password')
        .isString()
        .withMessage('Enter your email address and password.')
        .bail()
        .notEmpty()
        .withMessage('Enter your email address and password.')
];

const searchValidation = [
    body('from')
        .isString()
        .withMessage('Enter a departure station (up to 120 characters).')
        .bail()
        .trim()
        .isLength({ min: 1, max: 120 })
        .withMessage('Enter a departure station (up to 120 characters).'),
    body('to')
        .isString()
        .withMessage('Enter a destination station (up to 120 characters).')
        .bail()
        .trim()
        .isLength({ min: 1, max: 120 })
        .withMessage('Enter a destination station (up to 120 characters).')
        .custom((value, { req }) => value.toLocaleLowerCase() !== String(req.body.from || '').trim().toLocaleLowerCase())
        .withMessage('Choose a destination different from your departure station.'),
    body('journeyDate')
        .isString()
        .withMessage('Choose a valid journey date.')
        .bail()
        .trim()
        .isISO8601({ strict: true, strictSeparator: true })
        .withMessage('Choose a valid journey date.')
        .bail()
        .custom((value) => value >= new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10))
        .withMessage('Journey date cannot be in the past.'),
    body('travelClass')
        .isIn(['Sleeper', 'AC 3 Tier', 'AC 2 Tier', 'AC First Class', 'Chair Car'])
        .withMessage('Choose a valid travel class.')
];

module.exports = { signupValidation, loginValidation, searchValidation };
