var mongoose = require('mongoose'),
  assert = require('assert'),
  parse = require('co-body'),
  render = require('../lib/render'),
  User,
  userSchema;

userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  wins: Number,
  loses: Number,
  ties: Number,
  nickname: String
});
userSchema.methods.fullName = function () {
  return this.firstName + " " + this.lastName;
};
User = mongoose.model('User', userSchema);

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
  getUsersPage: function* () {
    var allUsers = yield User.find().exec();
    this.body = yield render('usersPage', {
      users: allUsers
    });
  }
};