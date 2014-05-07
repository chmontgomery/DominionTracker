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

})();