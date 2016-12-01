var spawn = require('cross-spawn');
var phantomScript = __dirname + '/capture.phantom.js'

module.exports = function(url, imagePath, options, callback) {
	var phantomArgs = [phantomScript, JSON.stringify(options)];
	var phantomProc = spawn('phantomjs', phantomArgs);
	
	phantomProc.stdout.setEncoding('utf-8');
	phantomProc.stdout.on('data', function(data) {
		// data = data.toString('utf8');
		// var str = '';
		// Object.keys(data).forEach(function(key) {
		// 	console.log(data[key]);
		// 	str += data[key];
		// });
		console.log('data:', data);
	});
	
	phantomProc.stderr.on('data', function(data) {
		console.log('error:', data);
	});
	
	phantomProc.on('exit', function(code) {
		console.log('exit:', code);
	});
};