const expect = require('chai').expect;
const nock = require('nock');
const fs = require('fs');
const reportMetrics = require('../../src/utils/metrics');

describe('Metrics', () => {
  it('should report metrics with default values in request body', function() {
    nock('https://www.google-analytics.com')
      .post('/collect')
      .once()
      .reply(200, function(uri, requestBody) {
        requestBody = JSON.parse(requestBody);
        expect(requestBody.v).to.deep.equal('1');
        expect(requestBody.cid).to.deep.equal(1);
        expect(requestBody.tid).to.deep.equal(process.env.GA_TRACKING_ID);
        return requestBody;
      });

     return reportMetrics({});
  });
});