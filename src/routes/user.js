const User = require('../models/user');
const Emailer = require('../utils/emailer');
const jwt = require('../utils/jwt');
const ERROR_MESSAGES = require('../utils/error-messages');

/**
 * POST /user
 * Creates a user if one doest not already exist with that username.
 * @param {Request} req
 * @param {Response} res
 */
exports.postUser = function(req, res) {
  let { email, password } = req.body;

  let user = new User({email, password});

  user.save()
    .then((user) => {
      res.send(200, {
        id : user._id,
        email
      })
    })
    .catch((err) => {
      let errors = {};
      let status = 400;

      if (err.code === 11000) {
        status = 409;
        errors.email = ERROR_MESSAGES.EMAIL_TAKEN;
      } else {
        if (err.errors.email) {
          errors.email = ERROR_MESSAGES.INVALID_EMAIL;
        }

        if (err.errors.password) {
          errors.password = ERROR_MESSAGES.INVALID_PASSWORD;
        }
      }

      res.send(status, {errors});
    });
};

/**
 * POST /user/decode-email
 * Gets a user
 * @param {Request} req
 * @param {Response} res
 */
exports.verifyEmail = function(req, res) {
  let { email } = req.body;

  User.findOne({email})
    .then((user) => {
      res.send(200, {
        isEmailAvailable: !user
      });
    })
    .catch((err) => {
      console.log('SHOULD NOT GET HERE in verifyEmail');
      res.send(200, {
        isEmailAvailable:true
      });
    });
};

/**
 * POST /user/reset-password
 * Send an email to the user with an email link to reset password
 * @param {Request} req
 * @param {Response} res
 */
exports.resetPassword = function(req, res) {
  let { email } = req.body;

  User.findUser({email})
    .then((user) => {
      let token = jwt.encode({id:user.id});

      Emailer.sendEmail({
        from : '"Joey Jiron" <test@test.com>', // TODO add the right email
        to : user.email,
        subject : 'Nuzify password reset',
        html: `<p>We heard that you lost your Nuzify password. Sorry about that!</p> 
          <p>But don’t worry! You can use the following link within the next day to reset your password:</p>
          <p>https://nuzify.com/password_reset/${token}</p>
          <p>If you don’t use this link within 24 hours, it will expire. To get a new password reset link, visit https://nuzify.com/password_reset</p>
          <p>Thanks, <br>
            Your friends at GitHub
          </p>
        `
      });


      res.send(200, {
        id : user.id,
        email : user.email,
        token : token,
        message:'Password has been reset and email was sent.'
      })
    })
    .catch((err) => {
      let errors = {};

      if (err === User.ERROR.USER_NOT_FOUND) {
        errors.user = 'User not found';
      } else {
        errors.email = 'A valid email is required';
      }

      res.send(400, {errors});
    });
};