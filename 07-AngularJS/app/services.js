(function () {
  'use strict';

  angular.module('railgoApp')
    .factory('AuthService', ['$q', '$rootScope', function ($q, $rootScope) {
      var usersKey = 'railgo.angular.users';
      var sessionKey = 'railgo.angular.session';
      var users = read(usersKey);

      function read(key) {
        try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (error) { return null; }
      }
      function save() { localStorage.setItem(usersKey, JSON.stringify(users)); }
      function normalize(email) { return (email || '').trim().toLowerCase(); }
      function digest(value) {
        var hash = 2166136261;
        for (var i = 0; i < value.length; i += 1) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); }
        return (hash >>> 0).toString(16);
      }
      if (!Array.isArray(users)) { users = []; }

      return {
        currentUser: function () { return read(sessionKey); },
        signup: function (form) {
          var email = normalize(form.email);
          if (users.some(function (user) { return user.email === email; })) { return { error: 'An account with this email already exists.' }; }
          var user = { name: form.name.trim(), email: email, mobile: form.mobile.trim(), passwordHash: digest(form.password) };
          users.push(user); save(); localStorage.setItem(sessionKey, JSON.stringify({ name: user.name, email: user.email, mobile: user.mobile }));
          $rootScope.$broadcast('auth:changed');
          return { user: user };
        },
        login: function (email, password) {
          var user = users.find(function (item) { return item.email === normalize(email) && item.passwordHash === digest(password); });
          if (!user) { return { error: 'We could not sign you in with those details.' }; }
          localStorage.setItem(sessionKey, JSON.stringify({ name: user.name, email: user.email, mobile: user.mobile }));
          $rootScope.$broadcast('auth:changed'); return { user: user };
        },
        logout: function () { localStorage.removeItem(sessionKey); $rootScope.$broadcast('auth:changed'); },
        update: function (profile) {
          var current = this.currentUser();
          var user = users.find(function (item) { return item.email === current.email; });
          if (!user) { return { error: 'Your session has expired. Please sign in again.' }; }
          user.name = profile.name.trim(); user.mobile = profile.mobile.trim(); save();
          localStorage.setItem(sessionKey, JSON.stringify({ name: user.name, email: user.email, mobile: user.mobile }));
          $rootScope.$broadcast('auth:changed'); return { user: user };
        },
        requireUser: function () { return this.currentUser() ? $q.when(this.currentUser()) : $q.reject('LOGIN_REQUIRED'); }
      };
    }])
    .factory('JourneyService', function () {
      var journey = null;
      return {
        set: function (value) { journey = angular.copy(value); },
        get: function () { return journey; }
      };
    });
}());
