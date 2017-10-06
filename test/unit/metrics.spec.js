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
      let req = {
        method : 'GET',
        _time : new Date( Date.now() - 1000),
        path() { return '/some/endpoint'; }
      };
      let res = {
        statusCode : 200
      };
      let payload = metrics.buildPayload(req, res);

      expect(payload.v).to.deep.equal('1');
      expect(payload.cid).to.deep.equal(1);
      expect(payload.tid).to.deep.equal(process.env.GA_TRACKING_ID);
      expect(payload.t).to.deep.equal('timing');
      expect(payload.utc).to.deep.equal(req.method);
      expect(payload.utt).to.be.greaterThan(0);
      expect(payload.utv).to.deep.equal(req.path());
      expect(payload.utl).to.deep.equal(res.statusCode);
    });
  });
});