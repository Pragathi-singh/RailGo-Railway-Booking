(function () {
  "use strict";
  angular
    .module("railgoApp")
    .controller("PageController", [
      "$scope",
      function ($scope) {
        $scope.pageTitle = "Page not found | RailGo";
      },
    ])
    .controller("HomeController", [
      "$scope",
      "$location",
      "JourneyService",
      function ($scope, $location, JourneyService) {
        $scope.pageTitle = "RailGo | Your Journey, Our Priority";
        $scope.today = new Date().toISOString().slice(0, 10);
        $scope.search = { date: new Date(), travelClass: "Sleeper" };
        $scope.classes = [
          "Sleeper",
          "AC 3 Tier",
          "AC 2 Tier",
          "AC First Class",
          "Chair Car",
        ];
        $scope.swap = function () {
          var from = $scope.search.from;
          $scope.search.from = $scope.search.to;
          $scope.search.to = from;
        };
        $scope.submit = function (form) {
          $scope.submitted = true;
          if (
            form.$invalid ||
            ($scope.search.from || "").trim().toLowerCase() ===
              ($scope.search.to || "").trim().toLowerCase()
          ) {
            $scope.sameStation = true;
            return;
          }
          $scope.sameStation = false;
          JourneyService.set($scope.search);
          $location.path("/search");
        };
      },
    ])
    .controller("ResultsController", [
      "$scope",
      "$location",
      "JourneyService",
      "BookingService",
      "AuthService",
      function (
        $scope,
        $location,
        JourneyService,
        BookingService,
        AuthService,
      ) {
        $scope.pageTitle = "Search results | RailGo";
        $scope.journey = JourneyService.get();
        $scope.trains = BookingService.trains();
        $scope.passengers = 1;
        $scope.book = function (train) {
          if (!AuthService.currentUser()) {
            $location.path("/login");
            return;
          }
          var result = BookingService.book(train, $scope.passengers);
          if (result.error) {
            $scope.error = result.error;
          } else {
            $scope.confirmed = result.booking;
          }
        };
      },
    ])
    .controller("LoginController", [
      "$scope",
      "$location",
      "AuthService",
      function ($scope, $location, AuthService) {
        $scope.form = {};
        $scope.login = function (form) {
          $scope.submitted = true;
          if (form.$invalid) return;
          var result = AuthService.login(
            $scope.form.email,
            $scope.form.password,
          );
          if (result.error) {
            $scope.error = result.error;
          } else {
            $location.path("/dashboard");
          }
        };
      },
    ])
    .controller("SignupController", [
      "$scope",
      "$location",
      "AuthService",
      function ($scope, $location, AuthService) {
        $scope.form = {};
        $scope.signup = function (form) {
          $scope.submitted = true;
          if (
            form.$invalid ||
            $scope.form.password !== $scope.form.confirmPassword
          ) {
            $scope.passwordMismatch = true;
            return;
          }
          $scope.passwordMismatch = false;
          var result = AuthService.signup($scope.form);
          if (result.error) {
            $scope.error = result.error;
          } else {
            $location.path("/dashboard");
          }
        };
      },
    ])
    .controller("ForgotPasswordController", [
      "$scope",
      function ($scope) {
        $scope.pageTitle = "Password help | RailGo";
        $scope.requestReset = function (form) {
          $scope.submitted = true;
          if (form.$invalid) return;
          $scope.sent = true;
        };
      },
    ])
    .controller("DashboardController", [
      "$scope",
      "AuthService",
      "BookingService",
      function ($scope, AuthService, BookingService) {
        $scope.user = AuthService.currentUser();
        $scope.pageTitle = "My account | RailGo";
        $scope.bookings = BookingService.list();
      },
    ])
    .controller("HistoryController", [
      "$scope",
      "BookingService",
      function ($scope, BookingService) {
        $scope.pageTitle = "Bookings | RailGo";
        $scope.bookings = BookingService.list();
        $scope.cancel = function (booking) {
          if (window.confirm("Cancel this booking?")) {
            BookingService.cancel(booking.id);
            $scope.bookings = BookingService.list();
          }
        };
      },
    ])
    .controller("ProfileController", [
      "$scope",
      "AuthService",
      function ($scope, AuthService) {
        $scope.profile = angular.copy(AuthService.currentUser());
        $scope.update = function (form) {
          $scope.submitted = true;
          if (form.$invalid) return;
          var result = AuthService.update($scope.profile);
          if (result.error) {
            $scope.error = result.error;
          } else {
            $scope.success = "Your profile has been updated.";
          }
        };
      },
    ]);
})();
