(function () {
  'use strict';

  angular.module('railgoApp', ['ngRoute'])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
      $locationProvider.hashPrefix('');
      $routeProvider
        .when('/', { templateUrl: 'views/home.html', controller: 'HomeController' })
        .when('/search', { templateUrl: 'views/results.html', controller: 'ResultsController' })
        .when('/login', { templateUrl: 'views/login.html', controller: 'LoginController' })
        .when('/signup', { templateUrl: 'views/signup.html', controller: 'SignupController' })
        .when('/forgot-password', { templateUrl: 'views/forgot-password.html', controller: 'ForgotPasswordController' })
        .when('/dashboard', { templateUrl: 'views/dashboard.html', controller: 'DashboardController', resolve: { auth: ['AuthService', function (AuthService) { return AuthService.requireUser(); }] } })
        .when('/history', { templateUrl: 'views/history.html', controller: 'HistoryController', resolve: { auth: ['AuthService', function (AuthService) { return AuthService.requireUser(); }] } })
        .when('/profile', { templateUrl: 'views/profile.html', controller: 'ProfileController', resolve: { auth: ['AuthService', function (AuthService) { return AuthService.requireUser(); }] } })
        .otherwise({ templateUrl: 'views/404.html', controller: 'PageController' });
    }])
    .run(['$rootScope', '$location', 'AuthService', function ($rootScope, $location, AuthService) {
      $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
        if (rejection === 'LOGIN_REQUIRED') {
          $location.path('/login');
        }
      });
      $rootScope.$on('$routeChangeSuccess', function (event, current) {
        $rootScope.pageTitle = current.$$route && current.$$route.title;
      });
      $rootScope.currentUser = AuthService.currentUser();
      $rootScope.logout = function () {
        AuthService.logout();
        $location.path('/');
      };
      $rootScope.$on('auth:changed', function () {
        $rootScope.currentUser = AuthService.currentUser();
      });
    }]);
}());
