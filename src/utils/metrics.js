const http = require('./http');

/**
 * @param {Object} data - the data to report to google analytics
 * @param {String} [data.v] - version of analytics. e.g. '1'
 * @param {String} [data.cid] -  Anonymous Client Identifier Ideally, this should be a UUID that is associated with particular user, device, or browser instance.
 * @param {String} data.t -  Event hit type.
 * @param {String} data.ec -  Event category.
 * @param {String} data.ea -  Event action.
 * @param {String} data.el -  Event label.
 * @param {String} data.ev -  Event value.
 */
module.exports = function(data) {
  // data = Object.assign({
  //   v : '1',
  //   cid : 1,
  //   tid : process.env.GA_TRACKING_ID
  // }, data);

  return http.post(process.env.GA_ENDPOINT_URL, {body:data}).catch((err) => {
    console.error('error sending metrics', err);
  });
};