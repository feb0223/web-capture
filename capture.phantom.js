var system = require('system');
var page = require('webpage').create();
var fs = require('fs');

// Read in arguments
var options = JSON.parse(system.args[1]);

console.log(JSON.stringify(options));



phantom.exit(0);