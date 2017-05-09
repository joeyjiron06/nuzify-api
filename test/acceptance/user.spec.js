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

  describe('POST /user/reset-password', () => {
    // create a fake mail server
    let maildevServer;

    before((done) => {
      maildevServer = new MailDev({
        ip: '127.0.0.1',
        port : config.nodemailer.port
      });
      maildevServer.listen(() => done());
    });

    afterEach(() => {
      maildevServer.removeAllListeners();
    });

    after((done) => {
      maildevServer.end(() => done());
    });


    it('should return 400 when no email is specified and an error message', () => {
      return MunchAPI.resetPassword(null)
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors).to.deep.equal({
            email : 'A valid email is required'
          });
        });
    });

    it('should return 400 when invalid email is sent and error message', () => {
      return MunchAPI.resetPassword('thisIsNotAValidEmailAddress')
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors).to.deep.equal({
            email : 'A valid email is required'
          });
        });
    });

    it('should return 400 when user is not found with that email and an error message', () => {
      return MunchAPI.resetPassword('joeyjiron06@gmail.com')
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors).to.deep.equal({
            user : 'User not found'
          });
        });
    });

    it('should return 200 when a valid email is given', () => {
      return MunchAPI.postUser({email:'test@test.com', password:'password'})
        .then(() => MunchAPI.resetPassword('test@test.com'))
        .then((res) => {
          expect(res).to.have.status(200);
        });
    });

    it('should return a valid token that can be used for /me/update-password/:token', () => {
      return MunchAPI.postUser({email:'test@test.com', password:'password'})
        .then(() => MunchAPI.resetPassword('test@test.com'))
        .then((res) => {
          return MunchAPI.updateMyPasswordWithToken('newPassword', res.body.token);
        })
        .then((res) => {
          expect(res).to.have.status(200);
        });
    });

    it('should send an actual email with a token', (done) => {
      // wait for mail server to receive a new email
      maildevServer.on('new', email => {
        expect(email, 'email exists').to.not.be.empty;
        expect(email.headers.from, 'should be from joey jiron').to.include('Joey Jiron');
        expect(email.headers.to, 'should be to the user').to.equal('test@test.com');
        expect(email.html, 'should have a body that contains').to.not.be.empty;
        done();
      });
      MunchAPI.postUser({email:'test@test.com', password:'password'})
        .then(() => MunchAPI.resetPassword('test@test.com'))
    });
  });
});