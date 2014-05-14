var koa = require('koa'),
  common = require('koa-common'),
  http = require('http'),
  route = require('koa-route'),
  serve = require('koa-static'),
  path = require('path'),
  app = koa(),
  mongoose = require('mongoose'),
  render = require('./src/lib/render'),
  homeController = require('./src/controllers/home'),
  userController = require('./src/controllers/user'),
  gameController = require('./src/controllers/game'),
  port;

mongoose.connect('mongodb://localhost/dominiontracker');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('connected to mongo successfully');
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
app.use(route.get('/saveScores/:id', gameController.getSaveScoresPage));

//game routes
app.use(route.get('/games', gameController.get));
app.use(route.get('/games/:id', gameController.getById));
app.use(route.put('/games/:id', gameController.put));
app.use(route.del('/games/:id', gameController.del));
app.use(route.post('/games', gameController.post));

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
