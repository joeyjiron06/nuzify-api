const chai = require('chai');
const server = require('../../index');
const chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);

describe('API v1', () => {
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
  });
});