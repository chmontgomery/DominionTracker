var koa = require('koa'),
  common = require('koa-common'),
  http = require('http'),
  route = require('koa-route'),
  serve = require('koa-static'),
  path = require('path'),
  app = koa(),
  homeController = require('./src/controllers/home'),
  gameController = require('./src/controllers/game'),
  port;

app.use(common.logger());
app.use(common.responseTime());

app.use(serve(path.join(__dirname, '/dist')));

app.use(route.get('/', homeController));

//game routes
app.use(route.get('/game', gameController.all));
app.use(route.get('/game/:id', gameController.get));
app.use(route.post('/game', gameController.add));
app.use(route.put('/game/:id', gameController.update));

port = Number(process.env.PORT || 1337);
http.createServer(app.callback()).listen(port, function () {
  console.log('listening on ' + port);
});
