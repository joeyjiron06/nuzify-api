const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * @param {object} payload - the JSON payload to encrypt into the token
 * @return {string} a json web token signed with the secret in the config
 */
exports.encode = function(payload) {
  return jwt.sign(payload, config.jwtSecret)
};


/**
 *
 * @param {string} jsonWebToken - a signed json webtoken
 * @return {object} the JSON payload object
 */
exports.decode = function(jsonWebToken) {
  return jwt.decode(jsonWebToken, config.jwtSecret)
};

