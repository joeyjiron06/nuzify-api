const { expect }= require('chai');
const config = require('../../src/config');
const MockMongoose = require('../lib/mock-mongoose');
const MailDev = require('maildev');
const MunchAPI = require('../lib/munch-api');
const ERROR_MESSAGES = require('../../src/utils/error-messages');

describe('User API', () => {
  before(() => {
    return MockMongoose.connect();
  });

  after(() => {
    return MockMongoose.disconnect();
  });

  beforeEach(() => {
    return MockMongoose.clear();
  });

  describe('POST /user', () => {

    it('should return 400 when no email is supplied', () => {
      return MunchAPI.postUser({'password': 'hello1234'}).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an.object;
        expect(res.body.errors).to.be.an.object;
        expect(res.body.errors.email).to.equal(ERROR_MESSAGES.INVALID_EMAIL);
        expect(res.body.errors.password).to.be.undefined;
      });
    });

    it('should return 400 when no password is supplied', () => {
      return MunchAPI.postUser({email: 'joey'}).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email).to.equal(ERROR_MESSAGES.INVALID_EMAIL);
        expect(res.body.errors.password).to.equal(ERROR_MESSAGES.INVALID_PASSWORD);
      });
    });

    it('should return 400 when no body is supplied', () => {
      return MunchAPI.postUser(null).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email).to.equal(ERROR_MESSAGES.INVALID_EMAIL);
        expect(res.body.errors.password).to.equal(ERROR_MESSAGES.INVALID_PASSWORD);
      });

    });

    it('should return 409 and email error message when email is already taken', () => {
      let user = {email:'joeyjiron06@gmail.com', password:'testpwd1234'};
      return MunchAPI.postUser(user).then((res) => MunchAPI.postUser(user)).catch((res) => {
        expect(res).to.have.status(409);
        expect(res.body.errors.email).to.equal(ERROR_MESSAGES.EMAIL_TAKEN);
      });
    });

    it('should return a 400 and an email error message when email is not in the right formate', () => {
      let user = {email:'notTheRightFormat', password:'23asdfasdf'};
      return MunchAPI.postUser(user).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email).to.equal(ERROR_MESSAGES.INVALID_EMAIL);
      });
    });

    it('should return a 400 and password error when password is too short', () => {
      let user = {email:'joeyjiron06@gmail.com', password:'122'};
      return MunchAPI.postUser(user).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email).to.be.undefined;
        expect(res.body.errors.password).to.equal(ERROR_MESSAGES.INVALID_PASSWORD);
      });
    });

    it('should return a 200 and user id when given good data', () => {
      let user = {email:'joeyjiron06@gmail.com', password:'12345678'};
      return MunchAPI.postUser(user).then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.id).to.not.be.empty;
        expect(res.body.email).to.equal('joeyjiron06@gmail.com');
      });
    });
  });

  describe('GET /user/verify-email', () => {
    it('should return true if email is available to use', () => {
      return MunchAPI.verifyEmail('joeyjiron06@gmail.com')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.isEmailAvailable).to.be.true;
        })
    });

    it('should return false if email is NOT available to use', () => {
      return MunchAPI.postUser({email:'joeyjiron06@gmail.com', password:'password'})
        .then(() => MunchAPI.verifyEmail('joeyjiron06@gmail.com'))
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.isEmailAvailable).to.be.false;
        })
    });
  });
});