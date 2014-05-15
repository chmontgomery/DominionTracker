var render = require(__dirname + '/../lib/render'),
  userStats = require('../lib/userStats');

module.exports = function* () {
  this.body = yield render('home', {
    users: yield userStats.find()
  });
};