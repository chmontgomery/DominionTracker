var render = require(__dirname + '/../lib/render');

module.exports = function* () {
  this.body = yield render('home', {});
};