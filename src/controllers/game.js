var mongoose = require('mongoose'),
  assert = require('assert'),
  parse = require('co-body'),
  Game,
  gameSchema;

gameSchema = mongoose.Schema({
  date: { type: Date, default: Date.now },
  cardSet: Array,
  scores: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      points: Number,
      result: String //win,loss,tie
    }
  ]
});
Game = mongoose.model('Game', gameSchema);

function *find() {
  return yield Game.find().exec();
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
    this.body = yield Game.findByIdAndUpdate(id, gamePut).exec();
  },
  post: function *() {
    var gamePost = yield parse(this);
    assert(gamePost.cardSet);
    this.body = yield Game.create(gamePost);
  }
};