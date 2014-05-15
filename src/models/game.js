var mongoose = require('mongoose'),
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
module.exports = mongoose.model('Game', gameSchema);