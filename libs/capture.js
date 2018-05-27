const path = require('path');
const fs = require('fs');

const puppeteer = require('puppeteer');

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
 * @param {String}  options.settings.userAgent
 * @param {Boolean} options.settings.userName
 * @param {Boolean} options.settings.password
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
  const newImagePath = `${imagePath}.png`;

  // create directory
  if (!fs.existsSync(path.dirname(newImagePath))){
      fs.mkdirSync(path.dirname(newImagePath));
  }

  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const { settings } = options;

    if (options.viewportSize) {
      page.setViewport(options.viewportSize);
    }

    if (settings.javascriptEnabled === false) {
      page.setJavaScriptEnabled(false);
    }
    if (settings.userAgent) {
      page.setUserAgent(options.settings.userAgent);
    }
    if (settings.userName && settings.password) {
      page.setExtraHTTPHeaders({
        Authorization: `Basic ${new Buffer(`${settings.userName}:${settings.password}`).toString('base64')}`
      });
    }

    const pageInfo = {
      errors: [],
      resourceErrors: []
    };

    page.on('error', error => {
      // pageInfo.errors.push(error.message);
      pageInfo.errors.push(error.stack.trim());
    });
    page.on('pageerror', error => {
      // pageInfo.errors.push(error.message);
      pageInfo.errors.push(error.stack.trim());
    });
    page.on('console', message => {
      if (message.type() === 'error') {
        pageInfo.errors.push(message.text().trim());
      }
    });
    page.on('response', res => {
      if (!res.ok()) {
        pageInfo.resourceErrors.push(`${res.status()} ${res.url()}`);
      }
    });

    await page.goto(url);

    await page.waitFor(options.wait);

    await page.screenshot({
      path: newImagePath,
      type: 'png',
      fullPage: true,
    });

    await browser.close();

    callback(null, pageInfo);
  })();
};
