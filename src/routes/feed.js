const Feeds = require('../Feeds');

/**
 * GET /feed
 * Parse a feed given a url
 * @param {Request} req
 * @param {Response} res
 */
exports.getFeed = function(req, res) {
  if (req.query.url) {
    Feeds.fetch(req.query.url)
      .then((feed) => {
        res.status(200)
          .json(feed);
      })
      .catch((response) => {
        res.status(400).json({
          url : req.query.url,
          message : 'invalid url'
        })
      });

  } else {
    res.status(400).json({
      message : 'You must specify a feed url'
    })
  }
};
