const Feeds = require('../Feeds');
const Feed = require('../models/feed');
const ERROR_MESSAGES = require('../utils/error-messages');

const FEED_NOT_FOUND = 'FEED_NOT_FOUND';
const FEED_HTTP_ERROR = 'FEED_HTTP_ERROR';

/**
 * GET /feed
 * Parse a feed given a url
 * @param {Request} req
 * @param {Response} res
 */
exports.getFeed = function(req, res) {
  let {id} = req.params;

  Feed.findById(id)
    .then((feed) => {
      res.send(200, feed.toJSON());
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
 * PUT /feeds
 * Add a feed
 * @param req
 * @param res
 */
exports.addFeed = function(req, res) {
  let {title, url} = req.body;
  let feed = new Feed({title, url});


  feed.save()
    .then((feed) => {
      res.send(200, feed);
    })
    .catch((err) => {
      // URL IS TAKEN - find it and return it to the client
      if (err.code === 11000) {
        Feed.findOne({url})
          .then((feed) => {
            res.send(400, {
              feed : feed.toJSON(),
              errors : {
                url : ERROR_MESSAGES.URL_TAKEN
              }
            });
          });
      }

      // ERROR SAVING FEED - didnt meet requirements
      else {
        let errors = {};

        if (err.errors.title) {
          errors.title = ERROR_MESSAGES.INVALID_TITLE;
        }

        if (err.errors.url) {
          errors.url = ERROR_MESSAGES.INVALID_URL;
        }

        res.send(400, {errors});
      }
    });
};

/**
 * GET /feeds/:id/articles
 * Get the current articles of a certain feed
 * @param req
 * @param res
 */
exports.getArticles = function(req, res) {
  let {id} = req.params;

  let foundFeed;

  return Feed.findById(id)
    .catch(() => {
      throw FEED_NOT_FOUND;
    })
    .then((feed) => {
      foundFeed = feed;
      return Feeds.fetch(feed.url);
    })
    .then((feed) => {
      foundFeed = foundFeed.toJSON();
      foundFeed.articles = feed.items;

      res.send(200, foundFeed);
    })
    .catch((err) => {
      let errors = {};

      if (err === FEED_NOT_FOUND) {
        errors.id = ERROR_MESSAGES.INVALID_ID;
      } else {
        errors.feed = ERROR_MESSAGES.FEED_HTTP_ERROR;
      }

      res.send(400, {errors});
    });
};