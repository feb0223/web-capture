const exec = require('child_process').exec;
const phantomjs = require('phantomjs-prebuilt');
const binPath = phantomjs.path;

module.exports = function(callback) {
  exec(`${binPath} --version`, (error, stdout, stderr) => {
    if (error) {
      console.log('[ERROR]', error);
    }
    if (stderr) {
      console.log('[STD_ERROR]', stderr);
    }

    callback(stdout.replace(/\n+$/g,''));
  });
};
