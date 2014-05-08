/**
 * Created by johnsont on 5/8/14.
 */
var render = require(__dirname + '/../lib/render');

module.exports = function* () {
    this.body = yield render('users', {});
};