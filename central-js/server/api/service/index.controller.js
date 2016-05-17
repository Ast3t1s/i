'use strict';
var _ = require('lodash');
var activiti = require('../../components/activiti');
var environmentConfig = require('../../config/environment');
//var environmentConfig = require('../../config');

var config = environmentConfig.activiti;
var request = require('request');
var catalogController = require('../catalog/catalog.controller.js');
var NodeCache = require("node-cache");

var nodeCache = new NodeCache({stdTTL: 10800, checkperiod: 11000});//Chache for 3 hours
var sHost = config.protocol + '://' + config.hostname + config.path;

var buildUrl = function (path) {
  return sHost + path;
};

module.exports.index = function (req, res) {
  var apiURL = '/action/item/getService?nID=' + req.query.nID
    , callback = function (error, response, body) {
    if (error) {
      res.statusCode = 500;
      res.send(error);
    } else {
      res.statusCode = response.statusCode;
      nodeCache.set(apiURL, body);
      res.send(body);
    }
  };

  nodeCache.get(apiURL, function( err, value ){
    if( !err ){
      if(value == undefined){
        return activiti.sendGetRequest(req, res, apiURL, null, callback);
      }else{
        return res.send(value);
      }
    }else{
      console.log('Error during get from cache the getService: ',err);
    }
  });
  //activiti.sendGetRequest(req, res, '/action/item/getService?nID=' + req.query.nID);
};

module.exports.getServiceStatistics = function (req, res) {
  var apiURL = '/action/event/getStatisticServiceCounts?nID_Service=' + req.params.nID
    , callback = function (error, response, body) {
    if (error) {
      res.statusCode = 500;
      res.send(error);
    } else {
      res.statusCode = response.statusCode;
      nodeCache.set(apiURL, body);
      res.send(body);
    }
  };

  nodeCache.get(apiURL, function( err, value ){
    if( !err ){
      if(value == undefined){
        return activiti.sendGetRequest(req, res, apiURL, null, callback);
      }else{
        return res.send(value);
      }
    }else{
      console.log('Error during get from cache the getStatisticServiceCounts: ',err);
    }
  });
  //activiti.sendGetRequest(req, res, '/action/event/getStatisticServiceCounts?nID_Service=' + req.params.nID, null, callback);
};

module.exports.setService = function (req, res) {
  var callback = function (error, response, body) {
    catalogController.pruneCache();
    res.send(body);
    res.end()
  };

  var url = buildUrl('/action/item/setService');

  request.post({
    'url': url,
    'auth': {
      'username': config.username,
      'password': config.password
    },
    'qs': {
      'nID_Subject': req.session.subject.nID
    },
    'headers': {
      'Content-Type': 'application/json; charset=utf-8'
    },
    'json': true,
    'body': req.body
  }, callback);
};

module.exports.removeServiceData = function (req, res) {

  var callback = function (error, response, body) {
    catalogController.pruneCache();
    res.send(body);
    res.end();
  };

  var url = buildUrl('/action/item/removeServiceData');

  request.del({
    'url': url,
    'auth': {
      'username': config.username,
      'password': config.password
    },
    'qs': {
      'nID': req.query.nID,
      'bRecursive': req.query.bRecursive,
      'nID_Subject': req.session.subject.nID
    }
  }, callback);
};
