var _ = require('lodash');

function getResultsByTimeperiod(games, userId) {

  function scoreSorter(score) {
    return score.points * -1;
  }

  function findUserResult(score) {
    if (!score || !score.user) {
      return false;
    }
    return userId.toString() === score.user._id.toString();
  }

  var results = {
    wins: 0,
    losses: 0,
    ties: 0,
    total: 0,
    second: 0,
    third: 0,
    fourth: 0,
    fifth: 0,
    sixth: 0,
    winPercentage: 0
  };
  for (var i = 0; i < games.length; i++) {
    var game = games[i];
    var userResult = _.find(game.scores, findUserResult);
    if (userResult) {
      switch (userResult.result) {
        case 'win':
          results.wins++;
          break;
        case 'loss':
          results.losses++;
          var sortedScores = _.sortBy(game.scores, scoreSorter);
          for (var j = 1; j < sortedScores.length; j++) {
            if (sortedScores[j].points === userResult.points) {
              switch (j) {
                case 1:
                  results.second++;
                  break;
                case 2:
                  results.third++;
                  break;
                case 3:
                  results.fourth++;
                  break;
                case 4:
                  results.fifth++;
                  break;
                case 6:
                  results.sixth++;
                  break;
              }
              break;
            }
          }
          break;
        case 'tie':
          results.ties++;
          break;
      }
      results.total++;
    }
  }
  if (results.total > 0)
    results.winPercentage = results.wins / results.total;
  return results;
}

module.exports = function (games, userId) {

  if (!games || !userId) {
    throw new Error('missing required args!');
  }

  var now = new Date();
  var daysInMs = 1000 * 60 * 60 * 24;
  var sevenDaysAgo = new Date(now - daysInMs * 7);
  var thrityDaysAgo = new Date(now - daysInMs * 30);
  var sixMonthsAgo = new Date(now - daysInMs * 182);
  var thisWeekGames = _.filter(games, function (game) {
    return game.date > sevenDaysAgo;
  });
  var thisMonthGames = _.filter(games, function (game) {
    return game.date > thrityDaysAgo;
  });
  var thisSixMonthGames = _.filter(games, function (game) {
    return game.date > sixMonthsAgo;
  });

  return {
    thisWeek: getResultsByTimeperiod(thisWeekGames, userId),
    thisMonth: getResultsByTimeperiod(thisMonthGames, userId),
    sixMonths: getResultsByTimeperiod(thisSixMonthGames, userId),
    allTime: getResultsByTimeperiod(games, userId)
  };
};