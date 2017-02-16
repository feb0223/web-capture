var system = require('system');
var webpage = require('webpage');
var fs = require('fs');

var url = system.args[1];
var imagePath = system.args[2];
var options = JSON.parse(system.args[3]);

var json = {
  errors: [],
  resourceErrors: []
};

var page = createPage(options);

page.open(url, function(status) {
  console.log('status:', status);

  if (!('wait' in options)) {
    options.wait = 0;
  }
  
  setTimeout(function() {
    page.render(imagePath);
    var basePath = imagePath.match(/(.+?\.)([\w]+)/)[1];
    var content = page.content;
    fs.write(basePath + 'html', content, 'w');
    fs.write(basePath + 'json', JSON.stringify(json), 'w');
    page.close();
    phantom.exit();
  }, options.wait);
});

page.onError = function(msg, trace) {
  var msgStack = ['ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
    });
  }
  json.errors.push(msgStack.join('\n'));
};

page.onResourceReceived = function(res) {
  if (res.status !== 200) {
    json.resourceErrors.push(JSON.stringify(res));
  }
};


function createPage(options) {
  var page = webpage.create();
  
  if (options.viewportSize) {
    page.viewportSize = options.viewportSize;
  }
      
  if (options.settings) {
    Object.keys(options.settings).forEach(function(key) {
      page.settings[key] = options.settings[key];
    });
  }
  
  if (options.customHeaders) {
    page.customHeaders = options.customHeaders;
  }
  
  if (options.storage) {
    
  }
  
  if (options.session) {
    
  }
  
  if (options.cookie) {
    
  }
  
  return page;
}