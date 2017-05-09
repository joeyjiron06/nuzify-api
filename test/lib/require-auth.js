const { expect }= require('chai');
const MunchAPI = require('./munch-api');


module.exports = function(method, url) {
  it('should return status 401 if no munchtoken is specified', () => {
    return MunchAPI.fetch(url, method)
      .then(() => {
        throw new Error('should throw an error');
      })
      .catch((res) => {
        expect(res).to.have.status(401);
      });
  });

  it('should return status 401 if an invalid munchtoken is specified', () => {
    return MunchAPI.fetch(url, method, null, {cookie:'munchtoken=iAmAnInvalidToken;'})
      .then(() => {
        throw new Error('should throw an error');
      })
      .catch((res) => {
        expect(res).to.have.status(401);
      });
  });
};
