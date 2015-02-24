(function () {
  'use strict';

  var module = angular.module('DominionTracker.filters', []);

  module.filter('percentage', ['$filter', function ($filter) {
    return function (input) {
      return $filter('number')(input * 100, 2) + '%';
    }
  }]);

})();