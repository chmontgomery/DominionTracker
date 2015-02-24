var buildUserStats = require('../src/lib/buildUserStats');
var should = require('should');
var _ = require('lodash');

describe('buildUserStats', function () {

  describe('should throw err', function () {

    it('when missing 1st arg', function () {
      (function () {
        buildUserStats();
      }).should.throw();
    });

    it('when missing 2nd arg', function () {
      (function () {
        buildUserStats([]);
      }).should.throw();
    });

  });

  describe('should return results', function () {

    var defaultTimeperiodResult,
      now = new Date(),
      daysInMs = 1000 * 60 * 60 * 24,
      sixDaysAgo = new Date(now - daysInMs * 6),
      twentyDaysAgo = new Date(now - daysInMs * 20),
      oneYearAgo = new Date(now - daysInMs * 365);

    beforeEach(function () {
      defaultTimeperiodResult = {
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
    });

    it('with proper result structure', function () {
      var results = buildUserStats([], '_myid');
      results.thisWeek.should.eql(defaultTimeperiodResult);
      results.thisMonth.should.eql(defaultTimeperiodResult);
      results.sixMonths.should.eql(defaultTimeperiodResult);
      results.allTime.should.eql(defaultTimeperiodResult);
    });

    it('with complex results', function () {
      var uuid = 'the_user_I_care_about';
      var games = [{
        date: sixDaysAgo,
        scores: [{
          user: {
            _id: uuid
          },
          points: 30,
          result: 'win'
        }, {
          user: {
            _id: 'a_different_user'
          },
          points: 20,
          result: 'loss'
        }, {
          user: {
            _id: 'a_different_user2'
          },
          points: 10,
          result: 'loss'
        }]
      }, {
        date: twentyDaysAgo,
        scores: [{
          user: {
            _id: uuid
          },
          points: 10,
          result: 'loss'
        }, {
          user: {
            _id: 'a_different_user'
          },
          points: 20,
          result: 'win'
        }]
      }, {
        date: oneYearAgo,
        scores: [{
          user: {
            _id: uuid
          },
          points: 10,
          result: 'tie'
        }, {
          user: {
            _id: 'a_different_user'
          },
          points: 10,
          result: 'tie'
        }, {
          user: {
            _id: 'a_different_user2'
          },
          points: 2,
          result: 'loss'
        }]
      }];
      var results = buildUserStats(games, uuid);
      results.thisWeek.should.eql(_.assign(defaultTimeperiodResult, {
        wins: 1,
        losses: 0,
        ties: 0,
        second: 0,
        total: 1,
        winPercentage: 1
      }));
      results.thisMonth.should.eql(_.assign(defaultTimeperiodResult, {
        wins: 1,
        losses: 1,
        ties: 0,
        second: 1,
        total: 2,
        winPercentage: .5
      }));
      results.sixMonths.should.eql(_.assign(defaultTimeperiodResult, {
        wins: 1,
        losses: 1,
        ties: 0,
        second: 1,
        total: 2,
        winPercentage: .5
      }));
      results.allTime.should.eql(_.assign(defaultTimeperiodResult, {
        wins: 1,
        losses: 1,
        ties: 1,
        second: 1,
        total: 3,
        winPercentage: 0.3333333333333333
      }));
    });

  });

});
