const Feed = require('../models/feed');
const User = require('../models/user');
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
      res.status(200).json(user.feeds);
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
          res.status(200).json(feed);
        });
    })
    .catch(() => {
      res.status(400).json({
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
    res.status(400).json({
      errors : {
        id : ERROR_MESSAGES.NOT_A_SAVED_FEED_ID
      }
    })
  } else {
    user.save()
      .then(() => {
        res.status(200).json({});
      });
  }


};