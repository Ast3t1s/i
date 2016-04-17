var url = require('url')
  , request = require('request')
  , FormData = require('form-data')
  , config = require('../../config/environment')
  //, config = require('../../config')
  , bankIDService = require('../../auth/bankid/bankid.service.js')
  , _ = require('lodash')
  , StringDecoder = require('string_decoder').StringDecoder
  , async = require('async')
  , formTemplate = require('./form.template')
  , activiti = require('../../components/activiti')
  , region = require('../../components/region')
  , errors = require('../../components/errors');

module.exports.index = function (req, res) {
  var sHost = req.region.sHost;
  var sID_BP_Versioned = req.query.sID_BP_Versioned;

  var callback = function (error, response, body) {
    res.send(body);
    res.end();
  };

  activiti.get('/service/form/form-data', {processDefinitionId: sID_BP_Versioned}, callback, sHost);
};

module.exports.submit = function (req, res) {
  var formData = req.body;
  var nID_Subject = req.session.subject.nID;
  var sHost = req.region.sHost;

  var properties = [];
  for (var id in formData.params) {
    if(formData.params.hasOwnProperty(id)){
      var value = formData.params[id];
      if (id === 'nID_Subject') {
        value = nID_Subject;
      }
      if (id === 'sID_UA' && formData.sID_UA_Common !== null) {
        value = formData.sID_UA_Common;
      } else if (id === 'sID_UA') {
        value = formData.sID_UA;
      }

      properties.push({
        id: id,
        value: value
      });
    }
  }

  var callback = function (error, response, body) {
    res.send(body);
    res.end();
  };

  var qs = {
    nID_Subject: nID_Subject,
    nID_Service: formData.nID_Service,
    nID_Region: formData.nID_Region,
    sID_UA: formData.sID_UA
  };

  var body = {
    processDefinitionId: formData.processDefinitionId,
    businessKey: "key",
    nID_Subject: nID_Subject,
    properties: properties
  };

  activiti.post('/service/form/form-data', qs, body, callback, sHost);
};

module.exports.scanUpload = function (req, res) {
  var accessToken = req.session.access.accessToken;
  var data = req.body;

//  this.autoUploadScans = function (oServiceData, scans) {
//    var data = {
//      //url: oServiceData.sURL + 'service/object/file/upload_file_to_redis',
//      nID_Server: oServiceData.nID_Server,

  console.log("[scanUpload]:req.nID_Server=" + req.nID_Server);
  var nID_Server = data.nID_Server;
  console.log("[scanUpload]:nID_Server=" + nID_Server);
  activiti.getServerRegionHost(nID_Server, function (sHost) {
    var sURL = sHost + '/service/object/file/upload_file_to_redis';
    console.log("[scanUpload]:sURL=" + sURL);

    var uploadURL = sURL; //data.url
    var documentScans = data.scanFields;
    console.log("[scanUpload]:data.scanFields=" + data.scanFields);

    var uploadResults = [];
    var uploadScan = function (documentScan, callback) {
      var scanContentRequest = bankIDService.prepareScanContentRequest(documentScan.scan.link, accessToken);

      var form = new FormData();
      form.append('file', scanContentRequest, {
        filename: documentScan.scan.type + '.' + documentScan.scan.extension
      });

      var requestOptionsForUploadContent = {
        url: uploadURL,
        auth: getAuth(),
        headers: form.getHeaders()
      };

      pipeFormDataToRequest(form, requestOptionsForUploadContent, function (result) {
        uploadResults.push({
          fileID: result.data,
          scanField: documentScan
        });
        callback();
      });
    };

    async.forEach(documentScans, function (documentScan, callback) {
      uploadScan(documentScan, callback);
    }, function (error) {
      res.send(uploadResults);
      res.end();
    });
  });

};

module.exports.signCheck = function (req, res) {
  var fileID = req.query.fileID;
  var sHost = req.region.sHost;

  var sURL = sHost + '/';
  console.log("sURL=" + sURL);

  if (!fileID) {
    res.status(400).send(errors.createError(errors.codes.INPUT_PARAMETER_ERROR, 'fileID should be specified'));
    return;
  }

  if (!sURL) {
    res.status(400).send(errors.createError(errors.codes.INPUT_PARAMETER_ERROR, 'sURL should be specified'));
    return;
  }

  var reqParams = activiti.buildRequest(req, 'service/object/file/check_file_from_redis_sign', {
    sID_File_Redis: fileID
  }, sURL);
  _.extend(reqParams, {json: true});

  request(reqParams, function (error, response, body) {
    if (error) {
      error = errors.createError(errors.codes.EXTERNAL_SERVICE_ERROR, 'Error while checking file\'s sign', error);
      res.status(500).send(error);
      return;
    }

    if (body.code && body.code === 'SYSTEM_ERR') {
      error = errors.createError(errors.codes.EXTERNAL_SERVICE_ERROR, body.message, body);
      res.status(500).send(error);
      return;
    }

    if (body.customer && body.customer.signatureData) {
      res.status(200).send(body.customer.signatureData);
    } else {
      res.status(200).send({});
    }
  });
};

module.exports.signForm = function (req, res) {
  var formID = req.session.formID;
  var oServiceDataNID = req.query.oServiceDataNID;

//  this.getSignFormPath = function (oServiceData, formID, oService) {
//    //return '/api/process-form/sign?formID=' + formID + '&sURL=' + oServiceData.sURL;
//    //--//return '/api/process-form/sign?formID=' + formID + '&sURL=' + oServiceData.sURL + '&sName=' + oService.sName;
//    return '/api/process-form/sign?formID=' + formID + '&nID_Server=' + oServiceData.nID_Server + '&sName=' + oService.sName;

  var nID_Server = req.query.nID_Server;
  activiti.getServerRegionHost(nID_Server, function (sHost) {
    var sURL = sHost + '/';
    console.log("sURL=" + sURL);

    //  var sURL = req.query.sURL;
    var sName = req.query.sName;


    if (!formID) {
      res.status(400).send({error: 'formID should be specified'});
    }

    if (!oServiceDataNID && !sURL) {
      res.status(400).send({error: 'Either sURL or oServiceDataNID should be specified'});
      return;
    }

    var callbackURL = url.resolve(originalURL(req, {}), '/api/process-form/sign/callback');
    if (oServiceDataNID) {
      req.session.oServiceDataNID = oServiceDataNID;
      //TODO use oServiceDataNID in callback
      //TODO fill sURL from oServiceData to use it below
    } else if (sURL) {
      req.session.sURL = sURL;
    }

    var createHtml = function (data, callback) {
      var formData = data.formData;

      var templateData = {
        formProperties: data.activitiForm.formProperties,
        processName: sName, //data.processName,
        businessKey: data.businessKey,
        creationDate: '' + new Date()
      };

      var patternFileName = null;

      templateData.formProperties.forEach(function (item) {
        var value = formData.params[item.id];
        if (value) {
          item.value = value;
        }
      });

      for (var key in formData.params) {
        if (formData.params.hasOwnProperty(key) && key.indexOf('PrintFormAutoSign_') === 0)
          patternFileName = formData.params[key];
      }

      if (patternFileName) {
        var reqParams = activiti.buildRequest(req, '/wf/service/object/file/getPatternFile', {sPathFile: patternFileName.replace(/^pattern\//, '')}, config.server.sServerRegion);
        request(reqParams, function (error, response, body) {
          for (var key in formData.params) {
            if (formData.params.hasOwnProperty(key)) {
              body = body.replace('[' + key + ']', formData.params[key]);
            }
          }
          callback(body);
        });
      } else {
        callback(formTemplate.createHtml(templateData));
      }
    };

    async.waterfall([
      function (callback) {
        loadForm(formID, sURL, function (error, response, body) {
          if (error) {
            callback(error, null);
          } else {
            callback(null, body);
          }
        });
      },
      function (formData, callback) {
        var accessToken = req.session.access.accessToken;
        createHtml(formData, function (formToUpload) {
          bankIDService.signHtmlForm(accessToken, callbackURL, formToUpload, function (error, result) {
            if (error) {
              callback(error, null);
            } else {
              callback(null, result)
            }
          });
        });
      }
    ], function (error, result) {
      if (error) {
        res.status(500).send(error);
      } else {
        res.redirect(result.desc);
      }
    });
  });
};

module.exports.signFormCallback = function (req, res) {
  var sURL = req.session.sURL;
  var formID = req.session.formID;
  var oServiceDataNID = req.session.oServiceDataNID;
  var codeValue = req.query.code;

  if (oServiceDataNID) {
    //TODO fill sURL from oServiceData to use it below
    sURL = '';
  }

  var signedFormForUpload = bankIDService
    .prepareSignedContentRequest(req.session.access.accessToken, codeValue);

  async.waterfall([
    function (callback) {
      loadForm(formID, sURL, function (error, response, body) {
        if (error) {
          callback(error, null);
        } else {
          callback(null, body);
        }
      });
    },
    function (formData, callback) {
      var signedFormUpload = sURL + 'service/object/file/upload_file_to_redis';
      var form = new FormData();
      form.append('file', signedFormForUpload, {
        filename: 'signedForm.pdf'
      });

      var requestOptionsForUploadContent = {
        url: signedFormUpload,
        auth: getAuth(),
        headers: form.getHeaders()
      };

      pipeFormDataToRequest(form, requestOptionsForUploadContent, function (result) {
        callback(null, {formData: formData, signedFormID: result.data});
      });
    }
  ], function (err, result) {
    if (err) {
      res.redirect(result.formData.restoreFormUrl
        + '?formID=' + formID
        + '&error=' + JSON.stringify(err));
    } else {
      res.redirect(result.formData.restoreFormUrl
        + '?formID=' + formID
        + '&signedFileID=' + result.signedFormID);
    }
  });

};

module.exports.saveForm = function (req, res) {
  var data = req.body;
  var oServiceDataNID = req.query.oServiceDataNID;

//    var params = {
//      //sURL : oServiceData.sURL
//      nID_Server : nID_Server
//    };
//    data = angular.extend(data, {
//      restoreFormUrl: restoreFormUrl
//    });
//
//    return $http.post('./api/process-form/save', data, {params : params}).then(function (response) {


  var nID_Server = req.query.nID_Server;
  activiti.getServerRegionHost(nID_Server, function (sHost) {
    var sURL = sHost + '/';
    console.log("sURL=" + sURL);

    //var sURL = req.query.sURL;

    if (oServiceDataNID) {
      //TODO fill sURL from oServiceData to use it below
      sURL = '';
    }

    var uploadURL = sURL + 'service/object/file/upload_file_to_redis';

    var form = new FormData();
    form.append('file', JSON.stringify(data), {
      filename: 'formData.json'
    });

    var requestOptionsForUploadContent = {
      url: uploadURL,
      auth: getAuth(),
      headers: form.getHeaders()
    };

    pipeFormDataToRequest(form, requestOptionsForUploadContent, function (result) {
      req.session.formID = result.data;
      if (oServiceDataNID) {
        req.session.oServiceDataNID = oServiceDataNID;
      } else {
        req.session.sURL = sURL;
      }
      res.send({formID: result.data});
    });
  });
};

module.exports.loadForm = function (req, res) {
  var formID = req.query.formID;

//  this.loadForm = function (oServiceData, formID) {
//    //var data = {sURL: oServiceData.sURL, formID: formID};
//    var data = {nID_Server: oServiceData.nID_Server, formID: formID};
//    return $http.get('./api/process-form/load', {params: data}).then(function (response) {

  var nID_Server = req.query.nID_Server;
  activiti.getServerRegionHost(nID_Server, function (sHost) {
    var sURL = sHost + '/';
    console.log("sURL=" + sURL);

    //  var sURL = req.query.sURL;

    var callback = function (error, response, body) {
      if (error) {
        res.status(400).send(error);
      } else {
        res.send(body);
      }
    };

    loadForm(formID, sURL, callback);
  });

};

function loadForm(formID, sURL, callback) {
  var downloadURL = sURL + 'service/object/file/download_file_from_redis_bytes';
  request.get({
    url: downloadURL,
    auth: getAuth(),
    qs: {
      key: formID
    },
    json: true
  }, callback);
}

function pipeFormDataToRequest(form, requestOptionsForUploadContent, callback) {
  var decoder = new StringDecoder('utf8');
  var result = {};
  form.pipe(request.post(requestOptionsForUploadContent))
    .on('response', function (response) {
      result.statusCode = response.statusCode;
    }).on('data', function (chunk) {
    if (result.data) {
      result.data += decoder.write(chunk);
    } else {
      result.data = decoder.write(chunk);
    }
  }).on('end', function () {
    callback(result);
  });
}

var originalURL = function (req, options) {
  options = options || {};
  var app = req.app;
  if (app && app.get && app.get('trust proxy')) {
    options.proxy = true;
  }
  var trustProxy = options.proxy;

  var proto = (req.headers['x-forwarded-proto'] || '').toLowerCase()
    , tls = req.connection.encrypted || (trustProxy && 'https' == proto.split(/\s*,\s*/)[0])
    , host = (trustProxy && req.headers['x-forwarded-host']) || req.headers.host
    , protocol = tls ? 'https' : 'http'
    , path = req.url || '';
  return protocol + '://' + host + path;
};

function getOptions() {
  var config = require('../../config/environment');
  //var config = require('../../config');

  var oConfigServerExternal = config.activiti;

  return {
    protocol: oConfigServerExternal.protocol,
    hostname: oConfigServerExternal.hostname,
    port: oConfigServerExternal.port,
    path: oConfigServerExternal.path,
    username: oConfigServerExternal.username,
    password: oConfigServerExternal.password
  };
}

function getAuth() {
  var options = getOptions();
  return {
    'username': options.username,
    'password': options.password
  };
}
