const { expect }= require('chai');
const NuzifyAPI = require('./nuzify-api');


module.exports = function(method, url) {
  it('should return status 401 if no nuzifytoken is specified', () => {
    return NuzifyAPI.fetch(url, method)
      .then(() => {
        throw new Error('should throw an error');
      })
      .catch((res) => {
        expect(res).to.have.status(401);
      });
  });

  it('should return status 401 if an invalid nuzifytoken is specified', () => {
    return NuzifyAPI.fetch(url, method, null, {cookie:'nuzifytoken=iAmAnInvalidToken;'})
      .then(() => {
        throw new Error('should throw an error');
      })
      .catch((res) => {
        expect(res).to.have.status(401);
      });
  });
};
