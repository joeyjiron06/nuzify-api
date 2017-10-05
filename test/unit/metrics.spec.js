const expect = require('chai').expect;
const metrics = require('../../src/utils/metrics');

describe('Metrics', () => {

  describe('buildPayload', function() {
    it('should throw an error when invalid args are passed in', function() {
      let error;
      try {
        metrics.buildPayload()
      } catch(e) {
        error = e;
      }

      expect(error).to.be.an.error;
    });

    it('should return a valid payload given a request and response object', function() {
      let req = {};
      let res = {};
      let payload = metrics.buildPayload(req, res);
      let expected = {
        v : '1',
        cid : 1,
        tid : process.env.GA_TRACKING_ID
      };
    
      expect(payload).to.deep.equal(expected);
    });
  });
});