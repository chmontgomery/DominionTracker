(function () {
  'use strict';

  var module = angular.module('DominionTracker.controllers', [
  ]);

  module.controller('HomeController', ['$scope',
    function (/*$scope*/) {
      console.log('Hello world!');
    }]);

    module.controller('UsersController', ['$scope',
    function (/*$scope*/) {

        }]);

  module.controller('startGameController', ['$scope',
    function ($scope) {
      $scope.cards = [];
      $scope.playersInGame = [];
      $scope.availableUsers = JSON.parse($scope.availableUsersString);
      $scope.generateCards = function() {
        console.log('generating cards...');
        //TODO
        $scope.cards = ['rats','rats', 'chapel'];
        $scope.generateCardsBtnTxt = 'Re-generate';
      };
      $scope.generateCardsBtnTxt = 'Generate Card Set';
      $scope.addUser = function(id) {
        var player = _.find($scope.availableUsers, function(p) {
          return p._id === id;
        });
        $scope.playersInGame.push(player);
        player.isSelected = true;
      };
      $scope.removePlayer = function(id) {
        _.remove($scope.playersInGame, function(p) {
          return p._id === id;
        });
        var user = _.find($scope.availableUsers, function(p) {
          return p._id === id;
        });
        user.isSelected = false;
      };
      $scope.startGame = function() {
      };
    }]);
})();