const User = require('../models/user');
const Emailer = require('../utils/emailer');
const jwt = require('../utils/jwt');

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
      res.status(200).json({
        id : user._id,
        email
      })
    })
    .catch((error) => {
      if (error.code === 11000) {
        let errors = { email : { message : `Email '${email}' is already taken`} };
        res.status(409).json({errors});
      } else {
        let { errors } = error;

        Object.keys(errors).forEach((key) => {
          let message = errors[key].message;
          errors[key] = { message };
        });

        res.status(400).json({errors});
      }
    });
};

/**
 * DELETE /user
 * Deletes a user
 * @param {Request} req
 * @param {Response} res
 */
exports.deleteUser = function(req, res) {
  let { id } = req.user;

  User.remove({_id:id})
    .then(() => {
      res.status(200).json({});
    })
    .catch(() => {
      res.status(400).json({
        errors : {id: {message:'A valid id is required. Please send a json like follows {"id":"myUserId"}'}}
      });
    });
};

/**
 * GET /user
 * Gets a user
 * @param {Request} req
 * @param {Response} res
 */
exports.getUser = function(req, res) {
  let { id } = req.body;

  User.findById(id)
    .then((user) => {
      res.status(200).json({
        id : user._id,
        email : user.email
      });
    })
    .catch(() => {
      res.status(400).json({
        errors : {
          id : {message : 'User not found'}
        }
      });
    });
};

/**
 * POST /user/update/password
 * Gets a user
 * @param {Request} req
 * @param {Response} res
 */
exports.updatePassword = function(req, res) {

  let { id,
        old_password,
        new_password,
        reset_password_token } = req.body;

  let verify;

  if (reset_password_token) {
    let user = jwt.decode(reset_password_token);
    verify = User.findUser({id:user.id});
  } else {
    verify = User.verifyPassword({id}, old_password);
  }

  verify
    .then((user) => {
      user.password = new_password;
      return user.save();
    })
    .then((user) => {
      res.status(200).json({
        id: user._id,
        email: user.email
      });
    })
    .catch((err) => {
      let errors = {};

      if (err === User.ERROR.INVALID_PASSWORD) {
        errors.old_password = {message : 'Your new password is invalid'};
      } else if (err === User.ERROR.USER_NOT_FOUND) {
        errors.id = {message : 'User not found'};
      } else {
        errors.new_password = {message : 'Invalid new password'};
      }

      res.status(400).json({errors});
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
      res.status(200).json({
        isEmailAvailable: !user
      });
    })
    .catch((err) => {
      console.log('SHOULD NOT GET HERE in verifyEmail');
      res.status(200).json({
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
        subject : 'Munch password reset',
        html: `<p>We heard that you lost your Munch password. Sorry about that!</p> 
          <p>But don’t worry! You can use the following link within the next day to reset your password:</p>
          <p>https://munch.com/password_reset/${token}</p>
          <p>If you don’t use this link within 24 hours, it will expire. To get a new password reset link, visit https://munch.com/password_reset</p>
          <p>Thanks, <br>
            Your friends at GitHub
          </p>
        `
      });


      res.status(200).json({
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

      res.status(400).json({errors});
    });
};