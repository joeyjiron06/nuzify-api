const chai = require('chai');
const server = require('../../index');
const chaiHttp = require('chai-http');
const mockServer = require('../lib/mock-server');
const MunchAPI = require('../lib/munch-api');
const MockMongoose = require('../lib/mock-mongoose');
const isURL = require('validator/lib/isURL');
const ERROR_MESSAGES = require('../../src/utils/error-messages');

const expect = chai.expect;

chai.use(chaiHttp);


describe('Feed API', () => {

  before(() => MockMongoose.connect());

  after(() => MockMongoose.disconnect());

  beforeEach(() => MockMongoose.clear());

  describe('GET /feeds/{id}', () => {
    it('should return status 400 and error message if invalid id is given', () => {
      return MunchAPI.getFeed('badID')
        .then(() => {
          throw new Error('should throw an error');
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.id).to.equal(ERROR_MESSAGES.INVALID_ID);
        });
    });

    it('should return status 200 and a single feed', () => {
      return MunchAPI.addFeed({title:'The Verge', url : 'https://verge.com/rss.xml'})
        .then((res) => {
          return MunchAPI.getFeed(res.body.id);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.id).to.not.be.empty;
          expect(res.body.title).to.equal('The Verge');
          expect(res.body.url).to.equal('https://verge.com/rss.xml');
        });
    });
  });


  describe('GET /feeds/{id}/articles', () => {
    before(() => mockServer.init(4000));
    after(() => mockServer.destroy(4000));

    it('should return status 400 when invalid feed id is specified', () => {
      return MunchAPI.getArticles('badFeedID')
        .then(() => {
          throw new Error('should throw an error');
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.id).to.equal(ERROR_MESSAGES.INVALID_ID);
        });
    });

    it('should return status 400 and error message when it cannot fetch a url for a feed', () => {
      let url = mockServer.getUrl('/somePathThatDoesNotExist');
      return MunchAPI.addFeed({title:'Dev', url})
        .then((res) => {
          return MunchAPI.getArticles(res.body.id);
        })
        .then(() => {
          throw new Error('should throw an error');
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.feed).to.equal(ERROR_MESSAGES.FEED_HTTP_ERROR);
        });
    });


    it('should return status 200 and a feed with articles', () => {
      let url = mockServer.getUrl('/atom.feed.xml');
      return MunchAPI.addFeed({title:'Dev', url})
        .then((res) => {
          return MunchAPI.getArticles(res.body.id);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.id).to.not.be.empty;
          expect(res.body.title).to.equal('Dev');
          expect(res.body.articles).to.be.an.instanceOf(Array);
          expect(res.body.articles).to.have.length(2);
          expect(res.body.articles[0].link).to.satisfy((val) => isURL(val));
          expect(res.body.articles[0].title).to.not.be.empty;
          expect(res.body.articles[0].img_url).to.not.be.empty;
        });
    });
  });   //TODO unit tests for cache


  describe('PUT /feeds', () => {
    it('should return status 400 and an error message if there is no title', () => {
      return MunchAPI.addFeed({})
        .then(() => {
          throw new Error('should throw an error');
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.title).to.be.equal(ERROR_MESSAGES.INVALID_TITLE);
        });
    });


    it('should return status 400 and an error message if there is no url', () => {
      return MunchAPI.addFeed({title:'hello'})
        .then(() => {
          throw new Error('should throw an error');
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.url).to.be.equal(ERROR_MESSAGES.INVALID_URL);
        });
    });

    it('should return status 400, an error message and feed if url of the feed is already taken', () => {
      return MunchAPI.addFeed({title:'The Verge', url:'https://theverge.com/rss.xml'})
        .then(() => {
          return MunchAPI.addFeed({title:'The Verge', url:'https://theverge.com/rss.xml'});
        })
        .then(() => {
          throw new Error('should throw an error');
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.url).to.be.equal(ERROR_MESSAGES.URL_TAKEN);
          expect(res.body.feed.id).to.not.be.empty;
          expect(res.body.feed.title).to.be.equal('The Verge');
          expect(res.body.feed.url).to.be.equal('https://theverge.com/rss.xml');
        });
    });

    it('should return status 200 and the feed upon successful creation', () => {
      return MunchAPI.addFeed({title:'The Verge', url:'https://theverge.com/rss.xml'})
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.id).to.not.be.empty;
          expect(res.body.title).to.equal('The Verge');
          expect(res.body.url).to.equal('https://theverge.com/rss.xml');
        });
    });
  });

});