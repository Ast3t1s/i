'use strict';

var should = require('should');
var appTest = require('../api/app.spec.js');
var testRequest = appTest.testRequest;

describe('auth service tests', function () {
  var agent;
  before(function (done) {
    appTest.loginWithBankID(done, function (loginAgent) {
      agent = loginAgent;
    });
  });

  it('should respond with 200 and remove cookie session', function (done) {
    var logout = testRequest.post('/auth/logout');
    agent.attachCookies(logout);
    logout.expect(200)
      .then(function (res) {
        console.log('result!!!');
        //TODO check why cookies are not removed
        done();
      }).catch(function (err) {
        done(err)
      });
  });
});
