var path = require('path');
var fs = require('fs-extra');
var async = require('async');
var chalk = require('chalk');

var capture = require('./libs/capture');
var userAgent = require('./libs/userAgent');

const constants = require('./constants');

var templatePath = path.join(__dirname, './template/capture_index.html');

/**
 * @param {Object} config
 * @param {Object} config.viewportSize
 * @param {Array}  config.urlList
 * @param {string} config.baseUrl
 * @param {string} config.userAgent
 * @param {Object} config.customHeaders
 * @param {number} config.wait - wait milli seconds
 * @param {string} config.destDir
 * @param {Object} config.cookie
 * @param {Object} config.storage - local storage
 * @param {Object} config.session - session storage
 * @param {Function} callback
 */
module.exports = function(config, callback) {
  if (!config.viewportSize) {
    config.viewportSize = {
      width: 1100,
      height: 900
    };
  }

  var timestamp = (new Date()).getTime().toString();
  var html = fs.readFileSync(templatePath);

  var urlInfoList = config.urlList.map(function(urlInfo) {
    if (urlInfo.path) {
      urlInfo.url = config.baseUrl + (urlInfo.path === '/' ? '' : urlInfo.path);
    }
    return urlInfo;
  });

  var options = {
    viewportSize: config.viewportSize,
    settings: {
      userAgent: userAgent(config.userAgent)
    },
    customHeaders: config.customHeaders,
    storage: config.storage,
    session: config.session,
    cookie: config.cookie
  };

  if (config.wait) {
    options.wait = config.wait;
  }

  fs.removeSync(config.destDir);
  fs.mkdirsSync(config.destDir);

  var cnt = 0;
  async.eachSeries(urlInfoList, function(urlInfo, next) {
    cnt++;
    urlInfo.fileName = (new Date()).getTime().toString();

    var imagePath = path.join(config.destDir, timestamp, urlInfo.fileName + '.png');
    capture(urlInfo.url, imagePath, options, function(err) {
      if (err) {
        console.log(chalk.red('[ERROR] capture', err));
      }
      console.log('[INFO] Captured', urlInfo.url, '=>', imagePath);
      next();
    });
  }, function() {
    var json = 'window.captureInfoList=' + JSON.stringify(urlInfoList) + ';window.pathVersion=' + timestamp;
    fs.writeFileSync(path.join(config.destDir, 'captureInfoList.js'), json);
    var html = fs.readFileSync(templatePath);
    fs.writeFileSync(path.join(config.destDir, 'index.html'), html);
    callback();
  });
};

module.exports.USER_AGENT = constants.USER_AGENT;
module.exports.HEADERS = constants.HEADERS;
module.exports.VIEWPORT_SIZE = constants.VIEWPORT_SIZE;
