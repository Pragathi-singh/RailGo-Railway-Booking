(function () {
  "use strict";

  angular.module("railgoApp").factory("ApiService", [
    "$http",
    function ($http) {
      var baseUrl = "http://127.0.0.1:3011/api";
      return {
        status: function () {
          return $http.get(baseUrl + "/status");
        },
        signup: function (form) {
          return $http.post(baseUrl + "/auth/signup", form, { withCredentials: true });
        },
        login: function (email, password) {
          return $http.post(baseUrl + "/auth/login", { email: email, password: password }, { withCredentials: true });
        },
        logout: function () {
          return $http.post(baseUrl + "/auth/logout", {}, { withCredentials: true });
        },
        me: function () {
          return $http.get(baseUrl + "/auth/me", { withCredentials: true });
        },
        updateProfile: function (profile) {
          return $http.put(baseUrl + "/profile", profile, { withCredentials: true });
        },
        search: function (search) {
          return $http.post(baseUrl + "/search", search, { withCredentials: true });
        },
        history: function () {
          return $http.get(baseUrl + "/bookings", { withCredentials: true });
        },
        createBooking: function (scheduleId, passengers) {
          return $http.post(baseUrl + "/bookings", { scheduleId: scheduleId, passengers: passengers }, { withCredentials: true });
        },
        cancel: function (id) {
          return $http.post(baseUrl + "/bookings/" + id + "/cancel", {}, { withCredentials: true });
        },
      };
    },
  ]);

  angular
    .module("railgoApp")
    .factory("AuthService", [
      "$q",
      "$rootScope",
      function ($q, $rootScope) {
        var usersKey = "railgo.angular.users";
        var sessionKey = "railgo.angular.session";
        var users = read(usersKey);

        function read(key) {
          try {
            return JSON.parse(localStorage.getItem(key) || "null");
          } catch (error) {
            return null;
          }
        }
        function save() {
          localStorage.setItem(usersKey, JSON.stringify(users));
        }
        function normalize(email) {
          return (email || "").trim().toLowerCase();
        }
        function digest(value) {
          var hash = 2166136261;
          for (var i = 0; i < value.length; i += 1) {
            hash ^= value.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
          }
          return (hash >>> 0).toString(16);
        }
        if (!Array.isArray(users)) {
          users = [];
        }

        return {
          currentUser: function () {
            return read(sessionKey);
          },
          signup: function (form) {
            var email = normalize(form.email);
            if (
              users.some(function (user) {
                return user.email === email;
              })
            ) {
              return { error: "An account with this email already exists." };
            }
            var user = {
              name: form.name.trim(),
              email: email,
              mobile: form.mobile.trim(),
              passwordHash: digest(form.password),
            };
            users.push(user);
            save();
            localStorage.setItem(
              sessionKey,
              JSON.stringify({
                name: user.name,
                email: user.email,
                mobile: user.mobile,
              }),
            );
            $rootScope.$broadcast("auth:changed");
            return { user: user };
          },
          login: function (email, password) {
            var user = users.find(function (item) {
              return (
                item.email === normalize(email) &&
                item.passwordHash === digest(password)
              );
            });
            if (!user) {
              return { error: "We could not sign you in with those details." };
            }
            localStorage.setItem(
              sessionKey,
              JSON.stringify({
                name: user.name,
                email: user.email,
                mobile: user.mobile,
              }),
            );
            $rootScope.$broadcast("auth:changed");
            return { user: user };
          },
          logout: function () {
            localStorage.removeItem(sessionKey);
            $rootScope.$broadcast("auth:changed");
          },
          update: function (profile) {
            var current = this.currentUser();
            var user = users.find(function (item) {
              return item.email === current.email;
            });
            if (!user) {
              return {
                error: "Your session has expired. Please sign in again.",
              };
            }
            user.name = profile.name.trim();
            user.mobile = profile.mobile.trim();
            save();
            localStorage.setItem(
              sessionKey,
              JSON.stringify({
                name: user.name,
                email: user.email,
                mobile: user.mobile,
              }),
            );
            $rootScope.$broadcast("auth:changed");
            return { user: user };
          },
          requireUser: function () {
            return this.currentUser()
              ? $q.when(this.currentUser())
              : $q.reject("LOGIN_REQUIRED");
          },
        };
      },
    ])
    .factory("JourneyService", function () {
      var journey = null;
      return {
        set: function (value) {
          journey = angular.copy(value);
        },
        get: function () {
          return journey;
        },
      };
    })
    .factory("BookingService", [
      "$rootScope",
      "AuthService",
      "JourneyService",
      function ($rootScope, AuthService, JourneyService) {
        var key = "railgo.angular.bookings";
        var trains = [
          {
            number: "12951",
            name: "Mumbai Rajdhani",
            departure: "17:00",
            arrival: "08:35",
            duration: "15h 35m",
            fare: 2450,
          },
          {
            number: "12002",
            name: "Bhopal Shatabdi",
            departure: "06:00",
            arrival: "14:05",
            duration: "8h 05m",
            fare: 1850,
          },
          {
            number: "12627",
            name: "Karnataka Express",
            departure: "19:20",
            arrival: "10:30",
            duration: "15h 10m",
            fare: 1320,
          },
        ];
        function read() {
          try {
            return JSON.parse(localStorage.getItem(key) || "[]");
          } catch (error) {
            return [];
          }
        }
        function write(bookings) {
          localStorage.setItem(key, JSON.stringify(bookings));
        }
        function userBookings() {
          var user = AuthService.currentUser();
          return user
            ? read().filter(function (booking) {
                return booking.email === user.email;
              })
            : [];
        }
        return {
          trains: function () {
            return angular.copy(trains);
          },
          list: userBookings,
          book: function (train, passengers) {
            var user = AuthService.currentUser();
            var journey = JourneyService.get();
            if (!user || !journey) {
              return {
                error: "Please sign in and search for a journey first.",
              };
            }
            var booking = {
              id: "RG-" + Date.now(),
              pnr: String(Math.floor(1000000000 + Math.random() * 9000000000)),
              email: user.email,
              origin: journey.from,
              destination: journey.to,
              journeyDate: journey.date,
              travelClass: journey.travelClass,
              train: train,
              passengers: passengers || 1,
              totalFare: train.fare * (passengers || 1),
              status: "CONFIRMED",
              bookedAt: new Date().toISOString(),
            };
            var bookings = read();
            bookings.unshift(booking);
            write(bookings);
            $rootScope.$broadcast("bookings:changed");
            return { booking: booking };
          },
          cancel: function (id) {
            var bookings = read();
            var booking = bookings.find(function (item) {
              return item.id === id;
            });
            if (
              !booking ||
              booking.email !== (AuthService.currentUser() || {}).email
            ) {
              return { error: "Booking not found." };
            }
            booking.status = "CANCELLED";
            booking.cancelledAt = new Date().toISOString();
            write(bookings);
            $rootScope.$broadcast("bookings:changed");
            return { booking: booking };
          },
        };
      },
    ]);
})();
