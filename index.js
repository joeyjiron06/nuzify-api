const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const feed = require("feed-read");

// app.use(bodyParser.json()); // for parsing application/json
// app.use(cors());            // add cors headers to all requests

// const feedRouter = express.Router();
// feedRouter.get('/', (req, res) => {
//   res.send("hello world");
//   return;
//
//   let feedUrl = req.query.url;
//
//   if (!feedUrl) {
//     res.status(400)
//       .json({
//         error : 'a url is required as a query param.'
//       });
//   }
//
//
//   else {
//     feedUrl = decodeURIComponent(feedUrl);
//
//     feed.get(feedUrl, (error, data) => {
//       if (error) {
//         console.log('error parsing feed', error);
//         res.status(400)
//           .json({
//             error : `unable to parse the given url  ${feedUrl} . Please pass a valid url`
//           });
//       } else {
//         res.status(200)
//           .json(data);
//       }
//     });
//   }
// });
//
// app.use('feed', feedRouter);


const PORT = 8080;
const app = express();

app.route('/v1/feed')
  .get((req, res) => {
    res.status(400).json({
      message : 'You must specify a feed url'
    })
  });


console.log('listening on port', PORT);

app.listen(PORT);


module.exports = app;
