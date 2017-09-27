const { expect } = require('chai');
const MockMongoose = require('../lib/mock-mongoose');
const http = require('../../src/utils/http');
const NuzifyAPI = require('../lib/nuzify-api');
const server = require('../../index');
let routes = [];
Object.keys(server.router.routes).forEach(key => {
  routes = routes.concat(server.router.routes[key]);
});


describe('Server', () => {
  before(() => {
    return MockMongoose.connect();
  });

  after(() => {
    return MockMongoose.disconnect();
  });

  beforeEach(() => {
    return MockMongoose.clear();
  });

  routes.forEach(route => {
    it(`should call the 'after' event for endpoint ${route.method} ${route.spec.path}`, function(done) {
      this.timeout(2000);
      // setup the listener that should be called after the request has been made.
      // if the callback is not called then the test will timeout
      server.once('after', function() {
        done();
      });
      NuzifyAPI.fetch(route.spec.path, route.method).catch(() => {});
    });
  });

});

