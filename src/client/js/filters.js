(function () {
  'use strict';

  var module = angular.module('DominionTracker.filters', []);

  module.filter('percentage', ['$filter', function ($filter) {
    return function (input) {
      return $filter('number')(input * 100, 2) + '%';
    }
  }]);

  module.filter('i18n', ['localizedTexts', function (localizedTexts) {
    return function (text) {
      if (localizedTexts.hasOwnProperty(text)) {
        return localizedTexts[text];
      }
      return text;
    };
  }]);

  // this can be in a seperate file, but should load after the filter is loaded
  module.value('localizedTexts', {
    'allTime': 'All Time',
    'sixMonths': 'Last 6 Months',
    'thisMonth': 'Last 30 days',
    'thisWeek': 'Last 7 days',
    'winPercentage': 'Win Percentage',
    'wins': 'Wins',
    'losses': 'Losses',
    'second': 'Seconds',
    'third': 'Thirds',
    'fourth': 'Fourths',
    'fifth': 'Fifth',
    'sixth': 'Sixths',
    'ties': 'Ties',
    'total': 'Played'
  });

})();