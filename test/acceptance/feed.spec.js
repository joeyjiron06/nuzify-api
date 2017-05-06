const chai = require('chai');
const server = require('../../index');
const chaiHttp = require('chai-http');
const mockServer = require('../lib/mock-server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('/GET feed', () => {
  before(() => {
    mockServer.init(6000);
  });
  after(() => {
    mockServer.destroy();
  });

  function getFeed(url) {
    return new Promise((resolve, reject) => {
      chai.request(server)
        .get(url !== undefined ? `/v1/feed?url=${url}` : '/v1/feed')
        .end((err, res) => {
          if (err) {
            reject(res);
          } else {
            resolve(res);
          }
        });

    });
  }

  it('should return 400 status code and error message when no url is specified', () => {
    return getFeed(undefined).catch((res) => {
        expect(res.status).to.equal(400);
        expect(res.body).to.deep.equal({
          message : 'You must specify a feed url'
        });
      });
  });

  it('should return 400 status code and error message an empty url is specified', () => {
    return getFeed('').catch((res) => {
      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        message : 'You must specify a feed url'
      });
    });
  });

  it('should return 400 status code and an error message when an INVALID RSS feed is specified', () => {
    return getFeed(encodeURIComponent('http://hi.com')).catch((res) => {
      expect(res.status).to.equal(400);
      expect(res.body).to.deep.equal({
        url : 'http://hi.com',
        message : 'invalid url'
      });
    });
  });

  it('should return an array of articles when given a url', () => {
    let mockExternalUrl =  mockServer.getUrl('/atom.feed.xml');
    return getFeed(encodeURIComponent(mockExternalUrl)).then((res) => {
      expect(res.status).to.equal(200);

      let feed = res.body;
      expect(feed).to.not.be.empty;

      expect(feed.source.img_url).to.not.be.empty;
      expect(feed.source.title).to.equal('The Verge - All Posts');
      expect(feed.source.link).to.equal('http://www.theverge.com/');

      let firstArticle = feed.items[0];
      expect(firstArticle.title).to.not.be.empty;
      expect(firstArticle.img_url).to.not.be.empty;
      expect(firstArticle.link).to.match(/^http:\/\/www\.theverge\.com/);
    });
  });

  it('should return CORS headers', () => {
    let mockExternalUrl = mockServer.getUrl('/atom.feed.xml');
    return getFeed(encodeURIComponent(mockExternalUrl)).then((res) => {
      let headers = res.headers;
      expect(headers['access-control-allow-origin']).to.equal('*');
    });
  });
});