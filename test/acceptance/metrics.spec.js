const { expect }= require('chai');
const nock = require('nock');
const MockMongoose = require('../lib/mock-mongoose');
const NuzifyAPI = require('../lib/nuzify-api');
const server = require('../../index');
let routes = [];
Object.keys(server.router.routes).forEach(key => {
  routes = routes.concat(server.router.routes[key]);
});

/**
 * We want to make sure that all our routes send metrics, so this test suite
 * enables us to make sure that happens.
 */
describe('Metrics', () => {
  before(() => {
    return MockMongoose.connect();
  });

  after(() => {
    nock.cleanAll();
    nock.restore();
    return MockMongoose.disconnect();
  });

  beforeEach(() => {
    return MockMongoose.clear();
  });


  // each route should have a test case
  routes.forEach(route => {
    let method = route.method;
    let path = route.spec.path;

    it(`should send metrics for endpoint ${method} ${path}`, function(done) {
      this.timeout(2000);
      nock(process.env.GA_ENDPOINT_URL)
      .post('/collect')
      .once()
      .reply(200, function(uri, requestBody) {
        expect(requestBody.v).to.deep.equal('1');
        expect(requestBody.cid).to.deep.equal(1);
        expect(requestBody.tid).to.deep.equal(process.env.GA_TRACKING_ID);
        expect(requestBody.utc).to.deep.equal(method);
        expect(typeof requestBody.utt).to.deep.equal('number');
        done();
        return requestBody;
      });
      
      NuzifyAPI.fetch(route.spec.path, route.method).catch(() => {});
    });
  });
});