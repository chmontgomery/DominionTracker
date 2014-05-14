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
      templateUrl: '/public/partials/users.html',
      scope: {
        usersString: "@"
      }
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

  module.directive('saveScores', function () {
    return {
      restrict: "E",
      replace: true,
      controller: 'saveScoresController',
      templateUrl: '/public/partials/saveScores.html',
      scope: {
        gameString: '@'
      }
    };
  });

})();