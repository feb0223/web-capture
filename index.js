const path = require('path');
const fs = require('fs-extra');
const async = require('async');
const chalk = require('chalk');

const capture = require('./libs/capture');
const version = require('./libs/version');
const userAgent = require('./libs/userAgent');

const constants = require('./constants');

const templatePath = path.join(__dirname, './template/capture_index.html');

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

  const timestamp = (new Date()).getTime().toString();
  const html = fs.readFileSync(templatePath);

  const urlInfoList = config.urlList.map(function(urlInfo) {
    if (urlInfo.path) {
      urlInfo.url = config.baseUrl + (urlInfo.path === '/' ? '' : urlInfo.path);
    }
    return urlInfo;
  });

  const options = {
    viewportSize: config.viewportSize,
    settings: {
      userAgent: userAgent(config.userAgent)
    },
    customHeaders: config.customHeaders,
    storage: config.storage,
    session: config.session,
    cookie: config.cookie,
    evaluateJavaScript: config.evaluateJavaScript ? config.evaluateJavaScript.toString() : null,
    injectJs: config.injectJs,
  };

  if (config.wait) {
    options.wait = config.wait;
  }

  fs.removeSync(config.destDir);
  fs.mkdirsSync(config.destDir);


  version((version) => {
    console.log(`PhantomJS Version: ${version}\n`);
    let cnt = 0;
    async.eachSeries(urlInfoList, function(urlInfo, next) {
      cnt++;
      urlInfo.fileName = (new Date()).getTime().toString();

      const filePath = path.join(config.destDir, timestamp, urlInfo.fileName);
      capture(urlInfo.url, filePath, options, function(err, pageInfo) {
        if (err) {
          console.log(chalk.red('[ERROR] capture', err));
        }
        console.log('[INFO] Captured', urlInfo.url, '=>', filePath + '.png\n');
        urlInfo.captureInfo = pageInfo;
        next();
      });
    }, function() {
      const json = 'window.captureInfoList=' + JSON.stringify(urlInfoList) + ';window.pathVersion=' + timestamp;
      fs.writeFileSync(path.join(config.destDir, 'captureInfoList.js'), json);
      const html = fs.readFileSync(templatePath);
      fs.writeFileSync(path.join(config.destDir, 'index.html'), html);
      callback();
    });
  });
};

module.exports.USER_AGENT = constants.USER_AGENT;
module.exports.HEADERS = constants.HEADERS;
module.exports.VIEWPORT_SIZE = constants.VIEWPORT_SIZE;
