var _ = require('lodash'),
  User = require('../models/user'),
  Game = require('../models/game');

function *findById(userId) {

  function findUserResult(score) {
    if (!score || !score.user) {
      return false;
    }
    return userId.toString() === score.user._id.toString();
  }

  var scoreSorter = function (score) {
    return score.points * -1;
  };

  //easy way - just fetch all and filter in code (get fancy later)
  var games = yield Game.find().populate('scores.user').exec();
  var results = {
    wins: 0,
    losses: 0,
    ties: 0,
    total: 0,
    second: 0,
    third: 0,
    fourth: 0,
    fifth: 0,
    sixth: 0,
    winPercentage: 0
  };
  for (var i = 0; i < games.length; i++) {
    var game = games[i];
    var userResult = _.find(game.scores, findUserResult);
    if (userResult) {
      switch (userResult.result) {
        case 'win':
          results.wins++;
          break;
        case 'loss':
          results.losses++;
          var sortedScores = _.sortBy(game.scores, scoreSorter);
          for (var j = 1; j < sortedScores.length; j++) {
            if (sortedScores[j].points === userResult.points) {
              switch (j) {
                case 1:
                  results.second++;
                  break;
                case 2:
                  results.third++;
                  break;
                case 3:
                  results.fourth++;
                  break;
                case 4:
                  results.fifth++;
                  break;
                case 6:
                  results.sixth++;
                  break;
              }
              break;
            }
          }
          break;
        case 'tie':
          results.ties++;
          break;
      }
      results.total++;
    }
  }
  if (results.total > 0)
    results.winPercentage = results.wins / results.total;
  return results;
}

function *find() {
  var allUsers = yield User.find().exec();
  var users = [];
  for (var i = 0; i < allUsers.length; i++) {
    var userObj = allUsers[i].toObject();
    userObj.results = yield findById(userObj._id);
    users.push(userObj); //why am I doing this? I don't know. but it works.
  }
  return users;
}

module.exports = {
  findById: findById,
  find: find
};