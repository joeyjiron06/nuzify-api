const { expect } = require('chai');
const MockMongoose = require('../lib/mock-mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const NuzifyAPI = require('../lib/nuzify-api');
const ERROR_MESSAGES = require('../../src/utils/error-messages');

describe('Auth API', () => {
  before(() => {
    return MockMongoose.connect();
  });

  after(() => {
    return MockMongoose.disconnect();
  });

  beforeEach(() => {
    return MockMongoose.clear();
  });



  describe('POST /authenticate', () => {
    it('should return a 400 user does not exist error if no user exists for that email', () => {
      return NuzifyAPI.authenticate('joeshmoe@gmail.com', 'password').catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          errors : {
            user : ERROR_MESSAGES.USER_NOT_EXISTS
          }
        });
      });
    });

    it('should return 400 when an invalid email is supplied', () => {
      return NuzifyAPI.authenticate('notAValidEmail','password').catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          errors : {
            email : ERROR_MESSAGES.INVALID_EMAIL
          }
        });
      });
    });

    it('should return 400 if password does not match the password on file', () => {
      return NuzifyAPI.postUser({email:'joeyjiron06@gmail.com', password:'mylittlesecret'})
        .then(() => NuzifyAPI.authenticate('joeyjiron06@gmail.com', 'thisIsTheWrongPassword'))
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.deep.equal({
            errors : {
              password : ERROR_MESSAGES.INVALID_PASSWORD
            }
          });
        });
    });

    it('should return a 200 success and json webtoken if email and password is correct', () => {
      let userId;
      return NuzifyAPI.postUser({email:'joeyjiron06@gmail.com', password:'mylittlesecret'})
        .then((res) => {
          userId = res.body.id;
          return NuzifyAPI.authenticate('joeyjiron06@gmail.com', 'mylittlesecret')
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.deep.equal({
            id : userId,
            email : 'joeyjiron06@gmail.com'
          });
        });
    });

    it('should return a json web token when login is susccessful', () => {
      return NuzifyAPI.postUser({email:'joeyjiron06@gmail.com', password:'mylittlesecret'})
        .then((res) => NuzifyAPI.authenticate('joeyjiron06@gmail.com', 'mylittlesecret'))
        .then((res) => {
          let cookie = res.cookie;
          expect(cookie.nuzifytoken, 'should have nuzifytoken cookie').to.not.be.empty;
          expect(cookie.nuzifytoken, 'should be a valid json webtoken').to.satisfy(value => jwt.decode(value, config.jwtSecret));
        });
    });
  });


});
