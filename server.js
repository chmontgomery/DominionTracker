var koa = require('koa'),
  common = require('koa-common'),
  http = require('http'),
  route = require('koa-route'),
  serve = require('koa-static'),
  parse = require('co-body'),
  path = require('path'),
  assert = require('assert'),
  app = koa(),
  mongoose = require('mongoose'),
  homeController = require('./src/controllers/home'),
  usersController = require('./src/controllers/users'),
  port,
  User;

mongoose.connect('mongodb://localhost/dominiontracker');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('connected to mongo successfully');
  var userSchema = mongoose.Schema({
    firstName: String,
    lastName: String
  });
  userSchema.methods.fullName = function () {
    return this.firstName + " " + this.lastName;
  };
  User = mongoose.model('User', userSchema);
});

app.use(common.logger());
app.use(common.responseTime());

app.use(serve(path.join(__dirname, '/dist')));

app.use(route.get('/', homeController));
app.use(route.get('/usersPage', usersController));

app.use(route.get('/users', function *() {
  var user = yield User.find().exec();
  this.body = user;
}));
app.use(route.get('/users/:id', function *(id) {
  var user = yield User.findById(id).exec();
  this.body = user;
}));
app.use(route.del('/users/:id', function *(id) {
  var user = yield User.findByIdAndRemove(id).exec();
  this.body = user;
}));
app.use(route.put('/users/:id', function *(id) {
  var userPut = yield parse(this);
  var user = yield User.findByIdAndUpdate(id, userPut).exec();
  this.body = user;
}));
app.use(route.post('/users', function *() {
  var userPost = yield parse(this);
  assert(userPost.firstName);
  assert(userPost.lastName);
  var user = yield User.create(userPost);
  this.body = user;
}));

port = Number(process.env.PORT || 1337);
http.createServer(app.callback()).listen(port, function () {
  console.log('listening on ' + port);
});
