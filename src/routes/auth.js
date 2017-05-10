const User = require('../models/user');
const jwt = require('../utils/jwt');
const ERROR_MESSAGES = require('../utils/error-messages');

/**
 * POST /authenticate
 * Authenticates a user and returns a Json web token.
 * @param {Request} req
 * @param {Response} res
 */
exports.postAuthenticate = function(req, res) {
  let { email, password } = req.body;

  User.verifyPassword({email}, password)
    .then((user) => {
      res.setCookie('munchtoken', jwt.encode({id:user.id}));
      res.send({
        id : user.id,
        email : user.email
      });
    })
    .catch((err) => {
      let errors = {};

      if (err === User.ERROR.INVALID_EMAIL) {
        errors.email = ERROR_MESSAGES.INVALID_EMAIL;
      } else if (err === User.ERROR.USER_NOT_FOUND) {
        errors.user = ERROR_MESSAGES.USER_NOT_EXISTS;
      } else if (err === User.ERROR.INVALID_PASSWORD) {
        errors.password = ERROR_MESSAGES.INVALID_PASSWORD;
      } else {
        errors.message = 'There was an unknown error authenticating the user';
        console.log('unknown error authing the user', err);
      }

      res.send(400, {errors});
    });
};

/**
 * Verify that the user is authed with a cookie
 * @param req
 * @param res
 * @param next
 */
exports.verifyUser = function(req, res, next) {
  let munchtoken = req.cookies.munchtoken;

  let user = jwt.decode(munchtoken) || {};

  User.findById(user.id)
    .then((user) => {
      if (user) {
        req.user = user;
        next();
      } else {
        res.send(401, {});
        next(false);
      }
    });
};

/**
 * Verify that the token is a valid token
 * @param req
 * @param res
 * @param next
 */
exports.verifyResetPasswordToken  = function(req, res, next) {
  let resetToken = req.params.token;

  let user = jwt.decode(resetToken) || {};

  User.findById(user.id)
    .then((user) => {
      if (user) {
        req.user = user;
        next();
      } else {
        res.send(401, {});
        next(new Error('no user found'));
      }
    });
};