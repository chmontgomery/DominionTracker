var mongoose = require('mongoose'),
  userSchema;

userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  nickname: String
});
userSchema.methods.fullName = function () {
  return this.firstName + " " + this.lastName;
};

module.exports = mongoose.model('User', userSchema);