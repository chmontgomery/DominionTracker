(function () {
  'use strict';

  var module = angular.module('DominionTracker.controllers', [
  ]);

  module.controller('HomeController', ['$scope',
    function (/*$scope*/) {
      console.log('Hello world!');
    }]);

  module.controller('UsersController', ['$scope',
    function ($scope) {
      $scope.users = JSON.parse($scope.usersString);

    }]);

  module.controller('startGameController', ['$scope', '$alert', '$http',
    function ($scope, $alert, $http) {
      $scope.cardSets = {
        Base: true
      };
      var errorAlert = {
        title: 'SOMETHING WENT WRONG',
        content: 'OH NOES',
        placement: 'top',
        type: 'danger',
        duration: 5,
        show: 'true'
      };
      var setGenerator = new DominionSetGenerator();
      $scope.cards = [];
      $scope.playersInGame = [];
      $scope.availableUsers = JSON.parse($scope.availableUsersString);
      $scope.generateCards = function() {
        console.log('generating cards...');
        //TODO
        var cards = setGenerator.generateSet(10);
        $scope.cards = _.mapValues(cards, function(card, cardName) {
          var newCard = {};
          _.forEach(_.keys($scope.cardSets), function(setName) {
            if (DominionSetGeneratorData.cardData[cardName][setName]) {
              newCard.setName = setName;
            }
          });
          var cost = _.findKey(DominionSetGeneratorData.cardData[cardName], function(c, k) {
            return k.indexOf('Cost') === 0;
          });
          if (cost) {
            newCard.cost = parseInt(cost[4]);
          }
          return newCard;
        });
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
        if ($scope.cards.length === 0) {
          errorAlert.content = "No cards have been generated";
          return $alert(errorAlert);
        } else if ($scope.playersInGame.length === 0) {
          errorAlert.content = "No users have been added";
          return $alert(errorAlert);
        }
        var game = {
          cardSet: _.keys($scope.cards),
          scores: []
        };
        _.forEach($scope.playersInGame, function(player) {
          game.scores.push({user:player._id});
        });
        $http({
          url: "/games",
          dataType: "json",
          method: "POST",
          data: JSON.stringify(game),
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }).success(function(){
          alert('game created'); //do a redirect to the game page to save scores?
        }).error(function(error){
          errorAlert.content = error;
          $alert(errorAlert);
        });
      };
      $scope.$watch(
        function() {
          console.log(_.values($scope.cardSets).join(','));
          return _.values($scope.cardSets).join('');
        }, function() {
          //reset owned cards on generator
          var cardsToSelectFrom = _.transform(DominionSetGeneratorData.cardData, function(result, card, key) {
            _.forEach(_.keys($scope.cardSets), function(setName) {
              if ($scope.cardSets[setName] && card[setName]) {
                result[key] = 1;
              }
            });
          });
          setGenerator.setOwned(cardsToSelectFrom);
      });
    }]);
})();