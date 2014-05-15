var assert = require('assert'),
  parse = require('co-body'),
  render = require('../lib/render'),
  Game = require('../models/game');

function *find() {
  return yield Game.find().populate('scores.user').exec();
}

module.exports = {
  find: function *() {
    return yield find();
  },
  get: function *() {
    this.body = yield Game.find().populate('scores.user').exec();
  },
  getById: function *(id) {
    this.body = yield Game.findById(id).populate('scores.user').exec();
  },
  del: function *(id) {
    this.body = yield Game.findByIdAndRemove(id).exec();
  },
  put: function *(id) {
    var gamePut = yield parse(this);
    //clean out the id
    if (gamePut._id) {
      delete gamePut._id;
    }
    this.body = yield Game.findByIdAndUpdate(id, gamePut).exec();
  },
  post: function *() {
    var gamePost = yield parse(this);
    assert(gamePost.cardSet);
    this.body = yield Game.create(gamePost);
  },
  getSaveScoresPage: function* (id) {
    var model = {};
    try {
      var g = yield Game.findById(id).populate('scores.user').exec();
      model.gameString = JSON.stringify(g);
    } catch (e) {
      console.log(e);
    }
    this.body = yield render('saveScores', model);
  }
};