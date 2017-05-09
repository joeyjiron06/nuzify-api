const { expect }= require('chai');
const config = require('../../src/config');
const MockMongoose = require('../lib/mock-mongoose');
const MunchAPI = require('../lib/munch-api');
const requireAuth = require('../lib/require-auth');
const ERROR_MESSAGES = require('../../src/utils/error-messages');

describe('Me API', () => {
  let user;

  before(() => {
    return MockMongoose.connect();
  });

  after(() => {
    return MockMongoose.disconnect();
  });

  beforeEach(() => {
    return MockMongoose.clear()
      .then(() => {
        return MunchAPI.postUser({email:'joeyjiron06@gmail.com', password:'password'});
      })
      .then((res) => {
        user = res.body;
        return MunchAPI.authenticate('joeyjiron06@gmail.com', 'password');
      })
      .then((res) => {
        user.munchtoken = res.cookie.munchtoken;
      });
  });

  // MY FEEDS endpoints
  describe('GET /me/feeds', () => {
    requireAuth('GET', '/v1/me/feeds');


    it('should return status 200 and an empty array for a new user', () => {
      return MunchAPI.getMyFeeds(user.munchtoken)
        .then((res) => {
          expect(res.body).to.be.an.instanceOf(Array);
          expect(res.body).to.have.length(0);
        });
    });

    it('should return status 200 and an array of feeds for the signed in user', () => {
      return MunchAPI.addFeed({url:'https://verge.com/rss.xml', title:'The Verge'})
        .then((res) => {
          return MunchAPI.addToMyFeeds(res.body.id, user.munchtoken);
        })
        .then(() => {
          return MunchAPI.getMyFeeds(user.munchtoken);
        })
        .then((res) => {
          let feeds = res.body;
          expect(feeds).to.have.length(1);
          expect(feeds[0].id).to.not.be.empty;
          expect(feeds[0].title).to.be.equal('The Verge');
          expect(feeds[0].url).to.be.equal('https://verge.com/rss.xml');
        });
    });
  });

  describe('PUT /me/feeds', () => {
    requireAuth('PUT', '/v1/me/feeds');

    it('should return status 400 and error message when no id is sent', () => {
      return MunchAPI.addToMyFeeds(null, user.munchtoken)
        .then(() => {
          throw new Error('should throw an error');
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.id).to.be.equal(ERROR_MESSAGES.INVALID_ID);
        });
    });

    it('should return status 400 and error message when an invalid id is sent', () => {
      return MunchAPI.addToMyFeeds('someInvalidID', user.munchtoken)
        .then(() => {
          throw new Error('should throw an error');
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.id).to.be.equal(ERROR_MESSAGES.INVALID_ID);
        });
    });

    it('should return status 200 when an authenticated user adds a feed', () => {
      return MunchAPI.addFeed({url:'https://verge.com/rss.xml', title:'The Verge'})
        .then((res) => {
          return MunchAPI.addToMyFeeds(res.body.id, user.munchtoken);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.id).to.not.be.empty;
          expect(res.body.title).to.equal('The Verge');
          expect(res.body.url).to.equal('https://verge.com/rss.xml');

          return MunchAPI.getMyFeeds(user.munchtoken);
        });
    });
  });

  describe('DELETE /me/feeds', () => {
    requireAuth('DELETE', '/v1/me/feeds');

    it('should return status 400 if the id is not in the users list', () => {
      return MunchAPI.removeFromMyFeeds('idIsNotInMyList', user.munchtoken)
        .then(() => {
          throw new Error('should throw an error');
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.id).to.equal(ERROR_MESSAGES.NOT_A_SAVED_FEED_ID);
        });
    });

    it('should delete a feed from user', () => {
      return MunchAPI.addFeed({url:'https://verge.com/rss.xml', title:'The Verge'})
        .then((res) => {
          return MunchAPI.addToMyFeeds(res.body.id, user.munchtoken);
        })
        .then((res) => {
          return MunchAPI.removeFromMyFeeds(res.body.id, user.munchtoken);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          return MunchAPI.getMyFeeds(user.munchtoken);
        })
        .then((res) => {
          expect(res.body).to.be.an.instanceOf(Array);
          expect(res.body).to.have.length(0);
        });
    });
  });
});