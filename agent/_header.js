var join = require('path').join
  , pfx = join(__dirname, '../_certs/MusiciansUniteDev.p12');

/*!
 * Create a new gateway agent
 */

var apnagent = require('apnagent')
  , agent = module.exports = new apnagent.Agent();

/*!
 * Configure agent
 */

agent
  .set('pfx file', pfx)
  .enable('sandbox');

agent.connect(function (err) {
  // gracefully handle auth problems
  if (err && err.name === 'GatewayAuthorizationError') {
    console.log('Authentication Error: %s', err.message);
    process.exit(1);
  }

  // handle any other err (not likely)
  else if (err) {
    throw err;
  }

  // it worked!
  var env = agent.enabled('sandbox')
    ? 'sandbox'
    : 'production';

  console.log('apnagent [%s] gateway connected', env);
});