const { expect } = require('chai');
const mongoose = require('mongoose');
const MockMongoose = require('../lib/mock-mongoose');
const User = require('../../src/models/user');
const Feed = require('../../src/models/feed');

/**
 * User/Feed model Tests
 * These are integration tests, testing the functionality of linking feeds to users
 * For testing purposes we only use an in memory database and connect to it
 *
 */
describe('User Feeds', () => {



  before(() => {
    return MockMongoose.connect();
  });

  after(() => {
    return MockMongoose.disconnect();
  });

  beforeEach(() => {
    return MockMongoose.clear();
  });

  function saveFeeds(numFeeds) {
    let promises = [];
    for (let i=0; i < numFeeds; ++i) {
      let feed = new Feed({
        title : `The Verge ${i}`,
        url : `https://verge.com/rss${i}.xml`,
      });
      promises.push(feed.save());
    }
    return Promise.all(promises);
  }

  it('should return an empty list of users feeds for new users', () => {
    let user = new User({
      email:'joeyjiron06@gmail.com',
      password:'password'
    });
    return user.save()
      .then(() => {
        return User.findUser({email:'joeyjiron06@gmail.com'});
      })
      .then((user) => {
        expect(user.feeds).to.be.empty;
      });
  });

  it('should save a users feeds and return them when queried', () => {

    let feed = new Feed({title:'The Verge', url:'https://verge.com/rss.xml'});
    let user = new User({
      email:'joeyjiron06@gmail.com',
      password:'password'
    });
    return user.save()
      .then(() => {
        return feed.save();
      })
      .then(() => {
        user.feeds.push(feed);
        return user.save();
      })
      .then((user) => {
        return User.findById(user._id).populate('feeds').exec();
      })
      .then((foundUser) => {
        expect(foundUser.feeds).to.not.be.empty;
        expect(foundUser.feeds[0].title).to.equal('The Verge');
        expect(foundUser.feeds[0].url).to.equal('https://verge.com/rss.xml');
      });
  });

  it('should throw an error when trying to add more than 100 feeds to a user', () => {
    let user = new User({
      email:'joeyjiron06@gmail.com',
      password:'password'
    });
    let feeds;
    return user.save()
      .then(() => {
        return saveFeeds(101);
      })
      .then((savedFeeds) => {
        feeds = savedFeeds;
        // add 100 feeds to the user to make it FULL!
        savedFeeds.forEach((feed, idx) => idx < 100 && user.feeds.push(feed));
        return user.save();
      })
      .then((user) => {
        user.feeds.push(feeds[feeds.length-1]);
        return user.save();
      })
      .then(() => {
        throw new Error('should throw an error');
      })
      .catch((err) => {
        expect(err.errors.feeds).to.not.be.empty;
      });
  });
});

