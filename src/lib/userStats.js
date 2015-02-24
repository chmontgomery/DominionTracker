var User = require('../models/user'),
  Game = require('../models/game'),
  buildUserStats = require('./buildUserStats');

function *findById(userId) {
  //easy way - just fetch all and filter in code (get fancy later)
  var games = yield Game.find().populate('scores.user', 'date').exec();
  return buildUserStats(games, userId);
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