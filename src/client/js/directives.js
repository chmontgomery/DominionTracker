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
      templateUrl: '/public/partials/home.html',
      scope: {
        usersString: "@"
      }
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

  module.directive('tally', function () {
    return {
      restrict: "E",
      replace: true,
      templateUrl: '/public/partials/tally.html',
      scope: {
        number: '='
      },
      link: function (scope, element) {
        var bgUrl = 'http://i.stack.imgur.com/96hvp.png',
          bgHeight = 125,
          bgVals = [
            // width, background position x
            [45, 25],
            [65, -35],
            [85, -115],
            [105, -215],
            [140, -360]
          ];

        var groups = Math.floor(scope.number / 5),
          remainder = scope.number % 5;

        for (var i = 0; i < groups; i++) {
          var $newTallyGroup = $('<div>');
          $newTallyGroup.css({
            background: 'url("' + bgUrl + '") ' +
              bgVals[4][1] + 'px 0 no-repeat transparent',
            float: 'left',
            width: bgVals[4][0] + 'px',
            height: bgHeight + 'px'
          });
          element.append($newTallyGroup);
        }

        if (remainder > 0) {
          var $newTally = $('<div>');
          $newTally.css({
            background: 'url("' + bgUrl + '") ' +
              bgVals[remainder - 1][1] + 'px 0 no-repeat transparent',
            float: 'left',
            width: bgVals[remainder - 1][0] + 'px',
            height: bgHeight + 'px'
          });
          element.append($newTally);
        }

      }
    };
  });

})();