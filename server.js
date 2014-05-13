var koa = require('koa'),
  common = require('koa-common'),
  http = require('http'),
  route = require('koa-route'),
  serve = require('koa-static'),
  parse = require('co-body'),
  path = require('path'),
  assert = require('assert'),
  render = require('./src/lib/render'),
  app = koa(),
  mongoose = require('mongoose'),
  render = require('./src/lib/render'),
  homeController = require('./src/controllers/home'),
  port,
  User,
  Game;

mongoose.connect('mongodb://localhost/dominiontracker');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('connected to mongo successfully');
  var userSchema = mongoose.Schema({
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

  var gameSchema = mongoose.Schema({
    date: { type: Date, default: Date.now },
    cardSet: Array,
    scores: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      points: Number,
      result: String //win,loss,tie
    }]
  });
  Game = mongoose.model('Game', gameSchema);
});

app.use(common.logger());
app.use(common.responseTime());

app.use(serve(path.join(__dirname, '/dist')));

app.use(route.get('/', homeController));
app.use(route.get('/usersPage', function* () {
        //get all users
        var allUsers = yield User.find().exec();
        console.log(allUsers);
        this.body = yield render('users', { users : allUsers });
}));

app.use(route.get('/startGame', function* () {
  var users = yield User.find().exec();
  this.body = yield render('startGame', {
    availableUsers: users
  });
}));

//game routes
app.use(route.get('/games', function *() {
  var games =  yield Game.find().populate('scores.user').exec();
  this.body = games;
}));

app.use(route.get('/games/:id', function *(id) {
  var game = yield Game.findById(id).populate('scores.user').exec();
  this.body = game;
}));

app.use(route.put('/games/:id', function *(id) {
  var gamePut = yield parse(this);
  var game = yield Game.findByIdAndUpdate(id, gamePut).exec();
  this.body = game;
}));

app.use(route.del('/games/:id', function *(id) {
  var game = yield Game.findByIdAndRemove(id).exec();
  this.body = game;
}));

app.use(route.post('/games', function *() {
  var gamePost = yield parse(this);
  assert(gamePost.cardSet);
  var game = yield Game.create(gamePost);
  this.body = game;
}));

//user routes
app.use(route.get('/users', function *() {
  var users = yield User.find().exec();
  this.body = users;
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
  userPost.wins = userPost.wins || 0;
  userPost.loses = userPost.loses || 0;
  userPost.ties = userPost.ties || 0;
  userPost.nickname = userPost.nickname || null;
  var user = yield User.create(userPost);
  this.body = user;
}));

port = Number(process.env.PORT || 1337);
http.createServer(app.callback()).listen(port, function () {
  console.log('listening on ' + port);
});
