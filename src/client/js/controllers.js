(function () {
  'use strict';
  var availableSets = {
    'Base': { name: 'Base'},
    'DarkAges': { name: 'Dark Ages'},
    'Intrigue': { name: 'Intrigue'},
    'Seaside': { name: 'Seaside'},
    'Guilds': { name: 'Guilds'}
  };
  var module = angular.module('DominionTracker.controllers', [
  ]);
  var makeCard = function (cardName) {
    var newCard = {};
    _.forEach(_.keys(availableSets), function (setName) {
      if (DominionSetGeneratorData.cardData[cardName][setName]) {
        newCard.setName = setName;
      }
    });
    var cost = _.findKey(DominionSetGeneratorData.cardData[cardName], function (c, k) {
      return k.indexOf('Cost') === 0;
    });
    if (cost) {
      newCard.cost = parseInt(cost[4]);
    }
    newCard.cardName = cardName;
    if (DominionSetGeneratorData.cardData[cardName].Blocker) {
      newCard.blockerValue = DominionSetGeneratorData.cardData[cardName].Blocker * -1;
      newCard.selectGroup = "Blockers";
    } else {
      newCard.blockerValue = 0;
      newCard.selectGroup = newCard.setName;
    }



    return newCard;
  };
  var errorAlert = {
    title: 'SOMETHING WENT WRONG',
    content: 'OH NOES',
    placement: 'top',
    type: 'danger',
    duration: 5,
    show: 'true'
  };
  var goodAlert = {
    title: 'SOMETHING WENT RIGHT',
    content: 'HOORAY',
    placement: 'top',
    type: 'success',
    duration: 5,
    show: 'true'
  };
  module.controller('HomeController', ['$scope',
    function ($scope) {
      $scope.users = JSON.parse($scope.usersString);
    }]);
  module.controller('UsersController', ['$scope', '$alert', '$http', '$modal',
    function ($scope, $alert, $http, $modal) {
      var confirmDeleteModal = $modal({title: 'Delete User', template: '/public/partials/confirmDelete.html', show: false, scope: $scope});
      var editUserModal = {};
      $scope.user = {};
      $scope.users = JSON.parse($scope.usersString);
      $scope.submit = function ($hide) {
        var submitUrl = '/users/';
        if ($scope.user !== undefined && $scope.user._id !== undefined && $scope.user._id.length > 0) {
          submitUrl += $scope.user._id;
          $http.put(submitUrl, $scope.user)
            .success(function (data) {
              $hide();
              var user = _.find($scope.users, function(u) {
                return u._id === data._id;
              });
              _.merge(user, data);
            }).error(function () {
              $alert(errorAlert);
            });
        } else {
          $http.post(submitUrl, $scope.user)
            .success(function (data) {
              $hide();
              $scope.users.push(data);
            }).error(function () {
              $alert(errorAlert);
            });
        }
      };
      $scope.cancel = function(hideModal) {
        $scope.user = {};
        hideModal();
      };
      $scope.editUser = function (id) {
        var getUrl = '/users/' + id;
        $http.get(getUrl).success(function (data) {
          $scope.user = data;
        }).error(function () {
          $alert(errorAlert);
        });
        //$scope.user = user;
        editUserModal = $modal({title: 'Edit User', template: '/public/partials/editUser.html', show: true, scope: $scope});
      };
      $scope.deleteUserConfirm = function (id) {
        $scope.UserToDeleteId = id;
        confirmDeleteModal.show();
      };
      $scope.deleteUser = function (id, $hide) {
        var deleteUrl = '/users/' + id;

        $http.delete(deleteUrl, null)
          .success(function (data) {
            _.remove($scope.users, function(user) { return data._id === user._id; });
            $hide();
          }).error(function () {
            $alert(errorAlert);
          });
      };
      $scope.predicate = 'results.wins';
      $scope.reverse = true;
      $scope.toggleSort = function(key) {
        if ($scope.predicate === key) {
          $scope.reverse = !$scope.reverse;
        }
        $scope.predicate = key;
      };

    }]);
  module.controller('saveScoresController', ['$scope', '$alert', '$http',
    function ($scope, $alert, $http) {
      if ($scope.gameString) {
        $scope.game = JSON.parse($scope.gameString);

        var getGameForSave = function (winningId) {
          //get fresh with the datas.
          var gameToSave = _.cloneDeep($scope.game);
          gameToSave.scores = _.sortBy(gameToSave.scores, function (score) {
            return score.points * -1;
          });
          _.forEach(gameToSave.scores, function (score, index, collection) {
            if (index === 0) {
              if (!winningId || winningId === collection[index].user._id) {
                collection[index].result = 'win';
              } else {
                collection[index].result = 'loss';
              }
            } else {
              if (winningId) {
                if (score.user._id === winningId) {
                  collection[index].result = 'win';
                } else {
                  collection[index].result = 'loss';
                }
              } else if (score.points === collection[0].points) {
                collection[index].result = 'tie';
                if (collection[0].result !== 'tie') {
                  collection[0].result = 'tie';
                }
              } else {
                collection[index].result = 'loss';
              }
            }
            collection[index].user = score.user._id;
          });
          gameToSave.cardSet = _.keys(gameToSave.cardSet);
          return gameToSave;
        };
        var saveGame = function (game) {
          $http({
            url: "/games/" + game._id,
            dataType: "json",
            method: "PUT",
            data: game,
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            }
          }).success(function () {
            var tieIds = [];
            _.forEach(game.scores, function (score) {
              if (score.result === 'tie') {
                tieIds.push(score.user);
              }
              _.find($scope.game.scores, function (modelScore) {
                return modelScore.user._id === score.user;
              }).result = score.result;
            });
            if (tieIds.length > 0) {
              goodAlert.content = 'Game saved, tie detected. Select a winner if there is one.';
              $alert(goodAlert);
            } else {
              goodAlert.content = 'Game Saved!';
              $alert(goodAlert);
            }
          }).error(function (error) {
            errorAlert.content = error;
            $alert(errorAlert);
          });
        };
        var cardSet = {};
        _.forEach($scope.game.cardSet, function (cardName) {
          cardSet[cardName] = makeCard(cardName);
        });
        $scope.game.cardSet = cardSet;
        $scope.selectWinner = function (winningId) {
          saveGame(getGameForSave(winningId));
        };
        $scope.saveScores = function () {
          saveGame(getGameForSave());
        };
      }
    }]);
  module.controller('startGameController', ['$scope', '$alert', '$http', '$window',
    function ($scope, $alert, $http, $window) {
      $scope.cardSets = {
        Base: true
      };
      $scope.balanceFactor = 1;
      var setGenerator = new DominionSetGenerator();
      //set name on all cards to make it easier to use of some of the _ fn's that return arrays
      _.forEach(DominionSetGeneratorData.cardData, function(card, name) {
        card.cardName = name;
      });
      $scope.cards = {};
      $scope.playersInGame = [];
      $scope.availableSets = availableSets;
      $scope.availableUsers = JSON.parse($scope.availableUsersString);

      $scope.generateCards = function () {
        setGenerator.setBalanceFactor($scope.balanceFactor);
        var cards = setGenerator.generateSet(10);
        $scope.cards = _.map(cards, function (card, cardName) {
          return makeCard(cardName);
        });
        $scope.generateCardsBtnTxt = 'Re-generate';
      };
      $scope.generateCardsBtnTxt = 'Generate Card Set';
      $scope.addUser = function (id) {
        var player = _.find($scope.availableUsers, function (p) {
          return p._id === id;
        });
        $scope.playersInGame.push(player);
        player.isSelected = true;
      };
      $scope.removePlayer = function (id) {
        _.remove($scope.playersInGame, function (p) {
          return p._id === id;
        });
        var user = _.find($scope.availableUsers, function (p) {
          return p._id === id;
        });
        user.isSelected = false;
      };
      $scope.startGame = function () {
        if ($scope.cards.length === 0) {
          errorAlert.content = "No cards have been generated";
          return $alert(errorAlert);
        } else if ($scope.playersInGame.length < 2) {
          errorAlert.content = "At least 2 players are required";
          return $alert(errorAlert);
        }
        var game = {
          cardSet: _.pluck($scope.cards, 'cardName'),
          scores: []
        };
        _.forEach($scope.playersInGame, function (player) {
          game.scores.push({user: player._id});
        });
        $http({
          url: "/games",
          dataType: "json",
          method: "POST",
          data: JSON.stringify(game),
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }).success(function (resp) {
          $window.location = '/saveScores/' + resp._id;
        }).error(function (error) {
          errorAlert.content = error;
          $alert(errorAlert);
        });
      };
      $scope.doSwap = function(index) {
        $scope.cards[index] = $scope.newCard;
      };
      $scope.$watch(
        function () {
          return _.values($scope.cardSets).join('');
        },
        function (oldValue, newValue) {
          if (oldValue === newValue && _.keys(setGenerator.owned).length > 0) {
            return;
          }
          //reset owned cards on generator
          var cardsToSelectFrom = _.transform(DominionSetGeneratorData.cardData, function (result, card, key) {
            _.forEach(_.keys(availableSets), function (setName) {
              if ($scope.cardSets[setName] && card[setName]) {
                result[key] = 1;
              }
            });
          });
          $scope.swapCards = _.sortBy(_.map(cardsToSelectFrom, function(c, name) {
            return makeCard(name);
          }), ['blockerValue','cardName']);
          setGenerator.setOwned(cardsToSelectFrom);
        });
    }]);

  module.controller('userDetailsController', ['$scope', '$alert', '$http', '$window',
    function ($scope) {
      $scope.user = JSON.parse($scope.userString);
    }]);
})();