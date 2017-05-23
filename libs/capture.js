var spawn = require('cross-spawn');
var path = require('path');
var phantomScript = path.join(__dirname, '../capture.phantom.js');
var phantomjs = require('phantomjs-prebuilt');
var binPath = phantomjs.path;

/**
 * @param {String} url
 * @param {String} imagePath
 *
 * @param {Object}  options
 *
 * @param {Object}  options.viewportSize
 * @param {Number}  options.viewportSize.width
 * @param {Number}  options.viewportSize.height
 *
 * @param {Object}  options.settings
 * @param {Boolean} options.settings.javascriptEnabled
 * @param {Boolean} options.settings.loadImages
 * @param {Boolean} options.settings.localToRemoteUrlAccessEnabled
 * @param {String}  options.settings.userAgent
 * @param {Boolean} options.settings.userName
 * @param {Boolean} options.settings.password
 * @param {Boolean} options.settings.XSSAuditingEnabled
 * @param {Boolean} options.settings.webSecurityEnabled
 * @param {Boolean} options.settings.resourceTimeout
 *
 * @param {Object}  options.customHeaders
 *
 * @param {Number}  options.wait
 *
 * @param {Object}  options.storage localStorage
 *
 * @param {Object}  options.session sessionStorage
 *
 * @param {Object}  options.cookie
 *
 * @param {Function} callback
 */
module.exports = function(url, imagePath, options, callback) {
  var phantomArgs = [phantomScript, url, imagePath, JSON.stringify(options)];
  // console.log('binPath', binPath);
  // console.log('phantomArgs', phantomArgs);
  var phantomProc = spawn(binPath, phantomArgs);

  phantomProc.stdout.setEncoding('utf-8');
  phantomProc.stdout.on('data', function(data) {
    // var str = '';
    // Object.keys(data).forEach(function(key) {
    // 	console.log(data[key]);
    // 	str += data[key];
    // });
    console.log(data.toString('utf8').replace(/\n+$/g,''));
  });

  phantomProc.stderr.on('data', function(data) {
    console.log('[error]', data.toString('utf8'));
  });

  phantomProc.on('exit', function(code) {
    // console.log('[exit]', code);
    callback();
  });
};
