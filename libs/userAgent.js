const USER_AGENT = require('../constants').USER_AGENT;

const userAgent = function(ua) {
  return USER_AGENT.hasOwnProperty(ua) ? USER_AGENT[ua] : ua;
};

module.exports = userAgent;
