const Feed  = require('./src/routes/feed');
const User = require('./src/routes/user');
const Me = require('./src/routes/me');
const Auth = require('./src/routes/auth');
const metrics = require('./src/utils/metrics');
const config = require('./src/config');
const mongoose = require('mongoose');
const restify = require('restify');
const cookieParser = require('restify-cookies');

const server = restify.createServer({
  name:'munch',
  version: '1.0.0'
});

mongoose.Promise = Promise;

server.use(cookieParser.parse);
server.use(restify.plugins.bodyParser(), (req, res, next) => {
  req.body = req.body || {};
  next();
});

// FEEDS
server.put('/v1/feeds', Feed.addFeed);
server.get('/v1/feeds/:id', Feed.getFeed);
server.get('/v1/feeds/:id/articles', Feed.getArticles);


// USER
server.post('/v1/user', User.postUser);
server.post('/v1/user/reset-password', User.resetPassword);
server.post('/v1/user/verify-email', User.verifyEmail);


// AUTH
server.post('/v1/authenticate', Auth.postAuthenticate);


// ME
server.get('/v1/me', Auth.verifyUser, Me.getMe);
server.del('/v1/me', Auth.verifyUser, Me.deleteMe);
server.get('/v1/me/feeds', Auth.verifyUser, Me.getFeeds);
server.put('/v1/me/feeds', Auth.verifyUser, Me.addFeed);
server.del('/v1/me/feeds', Auth.verifyUser, Me.deleteFeed);
server.post('/v1/me/update-password', Auth.verifyUser, Me.updatePassword);
server.post('/v1/me/update-password/:token', Auth.verifyResetPasswordToken, Me.updatePasswordWithToken);

// report metrics
server.on('after', function(req, res, route, err) {
  metrics.report(req, res);
});

console.log('listening on port', config.port);

server.listen(config.port);


module.exports = server;
