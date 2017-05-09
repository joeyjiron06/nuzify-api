const { expect }= require('chai');
const MailDev = require('maildev');
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

  describe('GET /me', () => {
    requireAuth('GET', '/v1/me');

    it('should return 200 and user info when valid user id is given', () => {
      return MunchAPI.getMe(user.munchtoken)
        .then((res) => {
          let user = res.body;
          expect(res).to.have.status(200);
          expect(user).to.deep.equal({
            id : user.id,
            email : 'joeyjiron06@gmail.com'
          });
        });
    });
  });

  describe('DELETE /me', () => {
    requireAuth('DELETE', '/v1/me');

    it('should delete a saved user if a valid json webtoken is present in the request', () => {
      return MunchAPI.deleteMe(user.munchtoken)
        .then((res) => {
          expect(res).to.have.status(200);
          return MunchAPI.getMe(user.munchtoken);
        })
        .then(() => {
          throw new Error('should be rejected');
        })
        .catch((res) => {
          expect(res).to.have.status(401);
        });
    });
  });

  describe('POST /me/update-password', () => {
    requireAuth('POST', '/v1/me/update-password');

    it('should return a 400 and error message when an invalid previous password is sent', () => {
      return MunchAPI.updateMyPassword('thewrongpassword', 'someNewPassword', user.munchtoken)
        .catch((res) => {
            expect(res).to.have.status(400);
            expect(res.body.errors.old_password).to.equal(ERROR_MESSAGES.INVALID_OLD_PASSWORD);
            expect(res.body.errors.new_password).to.be.undefined;
          });
    });

    it('should return a 400 and error message when in invalid new password is sent', () => {
      return MunchAPI.updateMyPassword('password', '2short', user.munchtoken)
        .then(() => {
          throw new Error('should throw an error');
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.new_password).to.equal(ERROR_MESSAGES.INVALID_PASSWORD);
          expect(res.body.errors.old_password).to.be.undefined;
        });
    });

    it('should return a 200 and user when password is updated properly', () => {
      return MunchAPI.updateMyPassword('password', 'newPassword', user.munchtoken)
      .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.email).to.equal('joeyjiron06@gmail.com');
          expect(res.body.id).to.equal(user.id);
        });
    });
  });
});