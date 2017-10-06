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
      let expected = {
        v : '1',
        cid : 1,
        tid : process.env.GA_TRACKING_ID,
        t : 'timing',  // event type
        utc : req.method, // timing category
        utt : (Date.now() - req._time), // timing time
        utv : req.path(), //timing variable
        utl : res.statusCode // Timing label.
      };
    
      expect(payload).to.deep.equal(expected);
    });
  });
});