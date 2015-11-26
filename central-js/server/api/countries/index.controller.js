'use strict';
var _ = require('lodash');
var activiti = require('../../components/activiti');

module.exports.getCountryList = function (req, res) {
  activiti.sendGetRequest(req, res, '/services/getCountries', _.extend(req.query, req.params));
};

module.exports.getCountry = function (req, res) {
  activiti.sendGetRequest(req, res, '/services/getCountry', _.extend(req.query, req.params));
};
