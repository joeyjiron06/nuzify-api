const http = require('./http');


/**
 * @param {Object} req - a restify Request object
 * @param {Object} res - a restify Response object
 * @return {Object} a data object that can be used to post to google analytics
 */
exports.buildPayload = function(req, res) {
  return {
    v : '1',
    cid : 1,
    tid : process.env.GA_TRACKING_ID,
    t : 'timing',
    utc : req.method,
    utt : (Date.now() - req._time),
    utv : req.path(), //timing variable
    utl : res.statusCode // Timing label.
  };
};


/**
 * @param {Object} req - a restify Request object
 * @param {Object} res - a restify Response object
 * @return {Promise<HttpResponse>} a promise that yields an http response object
 */
exports.report  = function(req, res) {
  let payload = exports.buildPayload(req, res);
  return http.post(process.env.GA_TRACKING_URL, {body:payload}).catch((err) => {
    // console.error('error sending metrics', err);
  });
};