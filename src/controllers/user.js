var assert = require('assert'),
  co = require('co'),
  parse = require('co-body'),
  render = require('../lib/render'),
  _ = require('lodash'),
  Game = require('../models/game'),
  User = require('../models/user');

function *find() {
  return yield User.find().exec();
}

function *getResults(userId) {

  function findUserResult(score) {
    if (!score || !score.user) {
      return false;
    }
    return userId.toString() === score.user._id.toString();
  }

  var games = yield Game.find().populate('scores.user').exec(); //easy way - just fetch all and filter in code (get fancy later)
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

module.exports = {
  find: function *() {
    return yield find();
  },
  get: function *() {
    this.body = yield find();
  },
  getById: function *(id) {
    this.body = yield User.findById(id).exec();
  },
  del: function *(id) {
    this.body = yield User.findByIdAndRemove(id).exec();
  },
  put: function *(id) {
    var userPut = yield parse(this);
    this.body = yield User.findByIdAndUpdate(id, userPut).exec();
  },
  post: function *() {
    var userPost = yield parse(this);
    assert(userPost.firstName);
    assert(userPost.lastName);
    userPost.wins = userPost.wins || 0;
    userPost.loses = userPost.loses || 0;
    userPost.ties = userPost.ties || 0;
    userPost.nickname = userPost.nickname || null;
    this.body = yield User.create(userPost);
  },
  getUsersPage: function *() {
    var allUsers = yield User.find().exec();
    var users = [];
    for (var i = 0; i < allUsers.length; i++) {
      var userObj = allUsers[i].toObject();
      userObj.results = yield getResults(userObj._id);
      users.push(userObj); //why am I doing this? I don't know. but it works.
    }
    this.body = yield render('usersPage', {
      users: users
    });
  }
};