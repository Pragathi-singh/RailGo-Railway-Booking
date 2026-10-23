'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../server');

function csrfFrom(html) {
    const match = html.match(/name="_csrf" value="([^"]+)"/);
    assert.ok(match, 'form contains a CSRF token');
    return match[1];
}

test('landing page, search validation, and journey response work', async () => {
    const agent = request.agent(createApp({ sessionSecret: 'test-session-secret-with-sufficient-length' }));
    const home = await agent.get('/').expect(302).expect('Location', '/home');
    assert.equal(home.status, 302);

    const page = await agent.get('/home').expect(200);
    assert.match(page.text, /Explore India/);
    assert.match(page.text, /Passenger train crossing the lush Konkan landscape/);
    await agent.get('/assets/images/train-hero.jpg').expect(200).expect('Content-Type', /image\/jpeg/);
    const token = csrfFrom(page.text);

    const invalid = await agent.post('/search').type('form').send({
        _csrf: token, from: 'Delhi', to: 'delhi',
        journeyDate: '2020-01-01', travelClass: 'Invalid'
    }).expect(422);
    assert.match(invalid.text, /different from your departure station/);
    assert.match(invalid.text, /Journey date cannot be in the past/);

    const valid = await agent.post('/search').type('form').send({
        _csrf: csrfFrom(invalid.text), from: 'Mumbai Central', to: 'New Delhi',
        journeyDate: '2099-01-01', travelClass: 'Sleeper'
    }).expect(200);
    assert.match(valid.text, /live train results are not available/i);
    assert.doesNotMatch(valid.text, /confirmed booking|seats available/i);
});

test('signup rejects invalid inputs and normalized duplicate email', async () => {
    const agent = request.agent(createApp({ sessionSecret: 'test-session-secret-with-sufficient-length' }));
    const signupPage = await agent.get('/signup').expect(200);
    const token = csrfFrom(signupPage.text);
    const invalid = await agent.post('/signup').type('form').send({
        _csrf: token, fullName: '', email: 'not-an-email', mobile: '123',
        password: 'weak', confirmPassword: 'different', terms: 'no'
    }).expect(422);
    assert.match(invalid.text, /Enter your name/);
    assert.match(invalid.text, /valid email address/);
    assert.match(invalid.text, /valid 10-digit Indian mobile/);
    assert.match(invalid.text, /passwords do not match/);

    const malformedPage = await agent.get('/signup').expect(200);
    const malformed = await agent.post('/signup').type('form').send({
        _csrf: csrfFrom(malformedPage.text), fullName: ['unexpected'], email: ['not-an-email'],
        mobile: ['123'], password: ['bad'], confirmPassword: ['bad'], terms: ['yes']
    }).expect(422);
    assert.match(malformed.text, /valid email address/);

    const fresh = await agent.get('/signup').expect(200);
    await agent.post('/signup').type('form').send({
        _csrf: csrfFrom(fresh.text), fullName: 'Demo Traveller', email: 'RailGo.Demo@example.com',
        mobile: '9876543210', password: 'RailGoPass123', confirmPassword: 'RailGoPass123', terms: 'yes'
    }).expect(302).expect('Location', '/login');

    const duplicatePage = await agent.get('/signup').expect(200);
    const duplicate = await agent.post('/signup').type('form').send({
        _csrf: csrfFrom(duplicatePage.text), fullName: 'Another Traveller', email: 'railgo.demo@EXAMPLE.com',
        mobile: '9876543211', password: 'RailGoPass456', confirmPassword: 'RailGoPass456', terms: 'yes'
    }).expect(409);
    assert.match(duplicate.text, /already exists/);
});

test('login, protected dashboard, logout, and CSRF rejection work', async () => {
    const agent = request.agent(createApp({ sessionSecret: 'test-session-secret-with-sufficient-length' }));
    let page = await agent.get('/signup').expect(200);
    await agent.post('/signup').type('form').send({
        _csrf: csrfFrom(page.text), fullName: 'Session Traveller', email: 'session@example.com',
        mobile: '9876543210', password: 'RailGoPass123', confirmPassword: 'RailGoPass123', terms: 'yes'
    }).expect(302);

    page = await agent.get('/login').expect(200);
    const failed = await agent.post('/login').type('form').send({
        _csrf: csrfFrom(page.text), email: 'session@example.com', password: 'WrongPass123'
    }).expect(401);
    assert.match(failed.text, /could not log you in with those details/i);
    assert.doesNotMatch(failed.text, /account does not exist/i);

    page = await agent.get('/login').expect(200);
    await agent.post('/login').type('form').send({
        _csrf: csrfFrom(page.text), email: 'SESSION@example.com', password: 'RailGoPass123'
    }).expect(302).expect('Location', '/dashboard');

    const dashboard = await agent.get('/dashboard').expect(200);
    assert.match(dashboard.text, /Welcome, Session Traveller/);
    await agent.post('/logout').type('form').send({ _csrf: csrfFrom(dashboard.text) }).expect(302);
    await agent.get('/dashboard').expect(302).expect('Location', '/login');
    await agent.post('/logout').type('form').send({ _csrf: 'invalid' }).expect(403);
});

test('EJS escapes user-provided profile content', async () => {
    const agent = request.agent(createApp({ sessionSecret: 'test-session-secret-with-sufficient-length' }));
    const signup = await agent.get('/signup').expect(200);
    await agent.post('/signup').type('form').send({
        _csrf: csrfFrom(signup.text), fullName: '<script>alert(1)</script>',
        email: 'escape@example.com', mobile: '9876543210',
        password: 'RailGoPass123', confirmPassword: 'RailGoPass123', terms: 'yes'
    }).expect(302);
    const login = await agent.get('/login').expect(200);
    await agent.post('/login').type('form').send({
        _csrf: csrfFrom(login.text), email: 'escape@example.com', password: 'RailGoPass123'
    }).expect(302);
    const dashboard = await agent.get('/dashboard').expect(200);
    assert.match(dashboard.text, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.doesNotMatch(dashboard.text, /<script>alert\(1\)<\/script>/);
});

test('unknown routes render a friendly not-found page', async () => {
    const response = await request(createApp({ sessionSecret: 'test-session-secret-with-sufficient-length' }))
        .get('/not-a-route').expect(404);
    assert.match(response.text, /couldn't find that page/i);
});
