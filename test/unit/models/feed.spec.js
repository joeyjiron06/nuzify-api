const {expect} = require('chai');
const mongoose = require('mongoose');
const MockMongoose = require('../../lib/mock-mongoose');
const Feed = require('../../../src/models/feed');

/**
 * Feed model Tests
 * These are integration tests, testing the methods on mongoose.
 * For testing purposes we only use an in memory database and connect to it
 */
describe('Feed Model', () => {
  let feed;

  before(() => {
    return MockMongoose.connect();
  });

  after(() => {
    return MockMongoose.disconnect();
  });

  beforeEach(() => {
    return MockMongoose.clear();
  });

  describe('save', () => {
    it('should return a promise', () => {
      feed = new Feed({});
      expect(feed.save()).to.be.instanceOf(Promise);
    });

    it('should return an error if no title or url is given', () => {
      feed = new Feed({});
      return feed.save().catch((err) => {
        expect(err.errors.title).to.not.be.empty;
        expect(err.errors.url).to.not.be.empty;
      });
    });

    it('should return an error if url is not a valid url', () => {
      feed = new Feed({title:'The Verge', url:'whatThisIsNotAUrl'});
      return feed.save().catch((err) => {
        expect(err.errors.url).to.not.be.empty;
        expect(err.errors.title).to.be.empty;
      });
    });

    it('should return an error if no title is given', () => {
      feed = new Feed({title:'', url:'https://verge.com/rss.xml'});
      return feed.save().catch((err) => {
        expect(err.errors.url).to.be.empty;
        expect(err.errors.title).to.not.be.empty;
      });
    });

    it('should return an error if url is already taken', () => {
      feed = new Feed({title:'The Verge', url:'https://verge.com/rss.xml'});
      return feed.save()
        .then(() => {
          feed = new Feed({title:'The Verge', url:'https://verge.com/rss.xml'});
          return feed.save();
        })
        .then(() => {
          throw new Error('should throw an error');
        })
        .catch((err) => {
          expect(err.code).to.equal(11000);
        });
    });
  });

  describe('find', () => {
    it('should not be able to find a feed that hasnt been saved', () => {
      return Feed.find({url:'unknownUrl'})
        .then((feed) => {
          expect(feed).to.be.empty;
        });
    });

    it('should find a feed that has been saved', () => {
      feed = new Feed({title:'The Verge', url:'https://verge.com/rss.xml'});
      return feed.save()
        .then(() => {
          return Feed.find({url:'https://verge.com/rss.xml'})
        })
        .then((feeds) => {
          expect(feeds).to.have.length(1);
          expect(feeds[0]).to.not.be.empty;
        })
    });
  });
});
