const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('AngularJS app defines required routes and services', () => {
  const app = read('app/app.js');
  assert.match(app, /angular\.module\('railgoApp', \['ngRoute'\]\)/);
  for (const route of ['/login', '/signup', '/dashboard', '/history', '/profile', '/search']) assert.match(app, new RegExp(`when\\('${route}`));
  assert.match(read('app/services.js'), /AuthService/);
  assert.match(read('app/services.js'), /passwordHash/);
});

test('customer-facing pages preserve RailGo identity and honest search state', () => {
  assert.match(read('views/home.html'), /Explore India/);
  assert.match(read('views/home.html'), /Your Journey/);
  assert.match(read('views/results.html'), /No live train results are available/);
  assert.match(read('views/shared/header.html'), /Rail<span>Go/);
});
