var assert = require('assert'),
  co = require('co'),
  parse = require('co-body'),
  render = require('../lib/render'),
  User = require('../models/user'),
  userStats = require('../lib/userStats');

function *find() {
  return yield User.find().exec();
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
    delete userPut._id;
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
    this.body = yield render('usersPage', {
      users: yield userStats.find()
    });
  }
};