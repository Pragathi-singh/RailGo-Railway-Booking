'use strict';

function notFoundHandler(req, res) {
    res.status(404).render('404', {
        title: 'Page not found',
        path: req.path
    });
}

function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    if (error.code === 'EBADCSRFTOKEN' || error.status === 403) {
        return res.status(403).render('error', {
            title: 'Form expired',
            message: 'This form could not be verified. Refresh the page and try again.'
        });
    }

    console.error('RailGo request failed:', error.message);
    return res.status(500).render('error', {
        title: 'Something went wrong',
        message: 'We could not complete that request. Please try again.'
    });
}

module.exports = { notFoundHandler, errorHandler };
