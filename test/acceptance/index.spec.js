const chai = require('chai');
const server = require('../../index');
const chaiHttp = require('chai-http');
const fixtureServer = require('../lib/fixture-server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Server', () => {
  before(() => {
    fixtureServer.init(6000);
  });
  after(() => {
    fixtureServer.destroy();
  });


  describe('/GET feed', () => {
    it('should return 400 status code and error message when no url is specified', (done) => {
      chai.request(server)
        .get('/v1/feed')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.deep.equal({
            message : 'You must specify a feed url'
          });
          done();
        });
    });

    it('should return 400 status code and error message an empty url is specified', (done) => {
      chai.request(server)
        .get('/v1/feed?url')
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.deep.equal({
            message : 'You must specify a feed url'
          });
          done();
        });
    });

    it('should return 400 status code and an error message when an INVALID RSS feed is specified', (done) => {
      chai.request(server)
        .get(`/v1/feed?url=${encodeURIComponent('http://hi.com')}`)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).to.deep.equal({
            url : 'http://hi.com',
            message : 'invalid url'
          });
          done();
        });
    });

    it('should return an array of articles when given a url', (done) => {
      let fixtureUrl = 'http://localhost:6000/atom.feed.xml';
      chai.request(server)
        .get(`/v1/feed?url=${encodeURIComponent(fixtureUrl)}`)
        .end((err, res) => {
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

          done();
        });
    });

    it('should return CORS headers', (done) => {
      let fixtureUrl = 'http://localhost:6000/atom.feed.xml';
      chai.request(server)
        .get(`/v1/feed?url=${encodeURIComponent(fixtureUrl)}`)
        .end((err, res) => {
          let headers = res.headers;
          expect(headers['access-control-allow-origin']).to.equal('*');
          done();
        });

    });
  });
});