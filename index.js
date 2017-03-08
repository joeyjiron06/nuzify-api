const express = require('express');
const Feeds = require('./src/Feeds');
const cors = require('cors');


const PORT = 8080;
const app = express();
app.use(cors());// add cors headers to all requests

app.route('/v1/feed')
  .get((req, res) => {
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
  });


console.log('listening on port', PORT);

app.listen(PORT);


module.exports = app;
