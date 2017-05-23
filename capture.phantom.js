(function() {
  const system = require('system');
  const webpage = require('webpage');
  const fs = require('fs');

  const url = system.args[1];
  const filePath = system.args[2];
  const options = JSON.parse(system.args[3]);

  const json = {
    errors: [],
    resourceErrors: []
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

    return page;
  }


  if (options.cookie) {
    phantom.clearCookies();
    phantom.addCookie(options.cookie);
  }


  const page = createPage(options);

  page.open(url, function(status) {
    console.log('status:', status);

    if (!('wait' in options)) {
      options.wait = 0;
    }

    // local storage
    if (options.storage) {
      page.evaluate(function(storage) {
        Object.keys(storage).forEach(function(name) {
          window.localStorage.setItem(name, storage[name]);
        });
      }, options.storage);
    }

    // session storage
    if (options.session) {
      page.evaluate(function(session) {
        Object.keys(session).forEach(function(name) {
          window.sessionStorage.setItem(name, session[name]);
        });
      }, options.session);
    }

    // wait
    setTimeout(function() {
      page.render(filePath + '.png');
      var content = page.content;
      fs.write(filePath + '.html', content, 'w');
      fs.write(filePath + '.json', JSON.stringify(json), 'w');
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

})();
