var parse = require('co-body');
var _ = require('lodash');

var id = 125;
var games = [{
  date: new Date(),
  set: ['rats', 'rats', 'rats', 'rats', 'chapel', 'rats', 'rats', 'rats', 'rats', 'rats'],
  players:[
    {
      name: 'Scott',
      points: 30,
      win: false,
      tie: true
    },
    {
      name: 'TJ',
      points: 30,
      win: false,
      tie: true
    },
    {
      name: 'Chris',
      points: 29
    }
  ],
  id: 123
  },
  {
    date: new Date(),
    set: ['moat', 'lighthouse', 'chapel', 'rats', 'smithy', 'warehouse', 'rats', 'rats', 'rats', 'rats'],
    players:[
      {
        name: 'Scott',
        points: 10
      },
      {
        name: 'TJ',
        points: 15
      },
      {
        name: 'Chris',
        points: 29,
        win: true
      }
    ],
    id: 124
  }];

exports.all = function *() {
  this.body = games;
};

exports.get = function *(id) {
  var foundGame = null;
  games.forEach(function(game) {
    if (parseInt(id) === game.id) {
      foundGame = game;
      return false;
    }
  });
  if (foundGame)
    this.body = foundGame;
  else
    this.throw(404, 'game not found');
};

exports.add = function *(){
  var body = yield parse(this);
  if (!body.set || !body.players) {
    this.throw(400, 'i need all the datas!');
  }
  body.id = id++;
  body.date = new Date();
  games.push(body);
  this.status = 201;
  this.body = body;
};

exports.update = function *(id) {
  var body = yield parse(this);
  var foundGame = null;
  games.forEach(function(game, i) {
    if (parseInt(id) === game.id) {
      //update the things
      var date = game.date;
      games[i] = body;
      games[i].id = parseInt(id);
      games[i].date = date;
      foundGame = game;
      return false;
    }
  });
  if (!foundGame) {
    this.throw(404, 'game not found');
  }
  this.body = foundGame;
};