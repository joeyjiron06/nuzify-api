const Feed = require('../models/feed');
const User = require('../models/user');
const jwt = require('../utils/jwt');
const ERROR_MESSAGES = require('../utils/error-messages');

/**
 * GET /me/feeds
 * Retrieve a user's feeds
 * @param {Request} req
 * @param {Response} res
 */
exports.getFeeds = function(req, res) {
  User.findById(req.user._id)
    .populate('feeds')
    .exec()
    .then((user) => {
      res.send(200, user.feeds);
    });
};

/**
 * PUT /me/feeds
 * Add a feed to a user's list
 * @param {Request} req
 * @param {Response} res
 */
exports.addFeed = function(req, res) {
  let user = req.user;
  let feedId = req.body.id;


  Feed.findById(feedId)
    .then((feed) => {
      user.feeds.push(feed._id);
      return user.save()
        .then(() => {
          res.send(200, feed);
        });
    })
    .catch(() => {
      res.send(400, {
        errors : {
          id : ERROR_MESSAGES.INVALID_ID
        }
      });
    });
};

/**
 * DELETE /me/feeds
 * Remove a feed from a user's list
 * @param {Request} req
 * @param {Response} res
 */
exports.deleteFeed = function (req, res) {
  let user = req.user;
  let feedId = req.body.id;

  let originalLength = user.feeds.length;

  user.feeds = user.feeds.filter((feedObjectId) => {
    return feedObjectId.toString() !== feedId;
  });

  if (originalLength === user.feeds.length) {
    res.send(400, {
      errors : {
        id : ERROR_MESSAGES.NOT_A_SAVED_FEED_ID
      }
    })
  } else {
    user.save()
      .then(() => {
        res.send(200, {});
      });
  }


};


/**
 * GEt /me
 * The the authed user
 * @param {Request} req
 * @param {Response} res
 */
exports.getMe = function(req, res) {
  let { user } = req;

  res.send(200, {
    id : user._id,
    email : user.email
  });
};

/**
 * DELETE /me
 * Remove a user from the database
 * @param {Request} req
 * @param {Response} res
 */
exports.deleteMe = function(req, res) {
  let { id } = req.user;

  User.remove({_id:id})
    .then(() => {
      res.send(200, {});
    })
    .catch(() => {
      res.send(400, {
        errors : {
          id: ERROR_MESSAGES.INVALID_ID
        }
      });
    });
};

/**
 * POST /me/update-password
 * Updates password for a user
 * @param {Request} req
 * @param {Response} res
 */
exports.updatePassword = function(req, res) {
  let { old_password, new_password } = req.body;
  let { user } = req;

  user.comparePassword(old_password)
    .then((isValidPassword) => {
      if (!isValidPassword) {
        throw User.ERROR.INVALID_PASSWORD;
      }

      return user;
    })
    .then((user) => {
      user.password = new_password;
      return user.save();
    })
    .then((user) => {
      res.send(200, {
        id: user._id,
        email: user.email
      });
    })
    .catch((err) => {
      let errors = {};

      if (err === User.ERROR.INVALID_PASSWORD) {
        errors.old_password = ERROR_MESSAGES.INVALID_OLD_PASSWORD;
      } else {
        errors.new_password = ERROR_MESSAGES.INVALID_PASSWORD;
      }

      res.send(400, {errors});
    });
};

/**
 * POST /me/reset-password/:token
 * Send an email to the user with an email link to reset password
 * @param {Request} req
 * @param {Response} res
 */
exports.updatePasswordWithToken = function(req, res) {
  let { new_password } = req.body;
  let { user } = req;

  user.password = new_password;
  user.save()
  .then((user) => {
    res.send(200, {
      id: user._id,
      email: user.email
    });
  })
  .catch((err) => {
    let errors = {};

    if (err === User.ERROR.INVALID_PASSWORD) {
      errors.old_password = ERROR_MESSAGES.INVALID_OLD_PASSWORD;
    } else {
      errors.new_password = ERROR_MESSAGES.INVALID_PASSWORD;
    }

    res.send(400, {errors});
  });
};