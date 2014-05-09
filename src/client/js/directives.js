(function () {
  'use strict';

  var module = angular.module('DominionTracker.directives', []);

  module.directive('navbar', function () {
    return {
      restrict: "E",
      replace: true,
      templateUrl: '/public/partials/navbar.html'
    };
  });

  module.directive('home', function () {
    return {
      restrict: "E",
      replace: true,
      controller: 'HomeController',
      templateUrl: '/public/partials/home.html'
    };
  });

    module.directive('users', function () {
        return {
            restrict: "E",
            replace: true,
            controller: 'UsersController',
            templateUrl: '/public/partials/users.html'
        };
    });

  module.directive('startGame', function () {
    return {
      restrict: "E",
      replace: true,
      controller: 'startGameController',
      templateUrl: '/public/partials/startGame.html',
      scope: {
        availableUsersString: '@'
      }
    };
  });

})();