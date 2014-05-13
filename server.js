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
  userController = require('./src/controllers/user'),
  port,
  Game;

mongoose.connect('mongodb://localhost/dominiontracker');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('connected to mongo successfully');

  var gameSchema = mongoose.Schema({
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
});

app.use(common.logger());
app.use(common.responseTime());

app.use(serve(path.join(__dirname, '/dist')));

app.use(route.get('/', homeController));
app.use(route.get('/usersPage', userController.getUsersPage));

app.use(route.get('/startGame', function* () {
  var allUsers = yield userController.find();
  this.body = yield render('startGame', {
    availableUsers: allUsers
  });
}));

//game routes
app.use(route.get('/games', function *() {
  var games = yield Game.find().populate('scores.user').exec();
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
app.use(route.get('/users', userController.get));
app.use(route.get('/users/:id', userController.getById));
app.use(route.del('/users/:id', userController.del));
app.use(route.put('/users/:id', userController.put));
app.use(route.post('/users', userController.post));

port = Number(process.env.PORT || 1337);
http.createServer(app.callback()).listen(port, function () {
  console.log('listening on ' + port);
});
