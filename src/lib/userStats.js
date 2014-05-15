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

  //easy way - just fetch all and filter in code (get fancy later)
  var games = yield Game.find().populate('scores.user').exec();
  var results = {wins: 0, losses: 0, ties: 0, total: 0};
  for (var i = 0; i < games.length; i++) {
    var game = games[i];
    var userResult = _.find(game.scores, findUserResult);
    if (userResult) {
      switch (userResult.result) {
        case 'win':
          results.wins++;
          results.total++;
          break;
        case 'loss':
          results.losses++;
          results.total++;
          break;
        case 'tie':
          results.ties++;
          results.total++;
          break;
      }
    }
  }
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