const { expect }= require('chai');
const config = require('../../src/config');
const MockMongoose = require('../lib/mock-mongoose');
const MailDev = require('maildev');
const MunchAPI = require('../lib/munch-api');
const parseCookie = require('../lib/parse-cookie');


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
        expect(res.body.errors.email).to.be.an.object;
        expect(res.body.errors.email.message).to.not.be.empty;
        expect(res.body.errors.password).to.be.undefined;
      });
    });

    it('should return 400 when no password is supplied', () => {
      return MunchAPI.postUser({email: 'joey'}).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email.message).to.not.be.empty;
        expect(res.body.errors.password.message).to.not.be.empty;
      });
    });

    it('should return 400 when no body is supplied', () => {
      return MunchAPI.postUser(null).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email.message).to.not.be.empty;
        expect(res.body.errors.password.message).to.not.be.empty;
      });

    });

    it('should return 409 and email error message when email is already taken', () => {
      let user = {email:'joeyjiron06@gmail.com', password:'testpwd1234'};
      return MunchAPI.postUser(user).then((res) => MunchAPI.postUser(user)).catch((res) => {
        expect(res).to.have.status(409);
        expect(res.body.errors.email).to.not.be.empty;
      });
    });

    it('should return a 400 and an email error message when email is not in the right formate', () => {
      let user = {email:'notTheRightFormat', password:'23asdfasdf'};
      return MunchAPI.postUser(user).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email).to.not.be.empty;
      });
    });

    it('should return a 400 and password error when password is too short', () => {
      let user = {email:'joeyjiron06@gmail.com', password:'122'};
      return MunchAPI.postUser(user).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.email).to.be.undefined;
        expect(res.body.errors.password).to.not.be.empty;
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

  describe('DELETE /user', () => {

    it('should return a 401 if no webtoken is present', () => {
      return MunchAPI.postUser({email:'joeyj@gmail.com', password:'password'})
        .then((res) => {
          return MunchAPI.deleteUser(res.body.id);
        })
        .then(() => {
          throw new Error('should throw an error')
        })
        .catch((res) => {
          expect(res).to.have.status(401);
        });
    });

    it('should return a 401 if an invalied webtoken is received', () => {
      return MunchAPI.postUser({email:'joeyj@gmail.com', password:'password'})
        .then((res) => {
          return MunchAPI.deleteUser(res.body.id, 'badwebtoken');
        })
        .then(() => {
          throw new Error('should throw an error')
        })
        .catch((res) => {
          expect(res).to.have.status(401);
        });
    });

    it('should delete a saved user if a valid json webtoken is present in the request', () => {
      let jsonWebToken;
      let userId;
      return MunchAPI.postUser({email:'joeyj@gmail.com', password:'password'})
        .then((res) => {
          userId = res.body.id;
          return MunchAPI.authenticate('joeyj@gmail.com', 'password');
        })
        .then((res) => {
          let cookie = parseCookie(res.headers['set-cookie'][0]);
          jsonWebToken = cookie.munchtoken;
          return MunchAPI.deleteUser(jsonWebToken);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          return MunchAPI.getUser(userId);
        })
        .then(() => {
          throw new Error('should be rejected');
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.id.message).to.not.be.empty;
        });
    });
  });

  describe('GET /user', () => {

    it('should return 400 when not id is passed', () => {
      return MunchAPI.getUser(null).catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.id.message).to.not.be.empty;
      });
    });

    it('should return 400 when no user found with id', () => {
      return MunchAPI.getUser('12fakeid').catch((res) => {
        expect(res).to.have.status(400);
        expect(res.body.errors.id.message).to.not.be.empty;
      });
    });

    it('should return 200 and user info when valid user id is given', () => {
      let userId;
      return MunchAPI.postUser({email:'jo@gmail.com', password:'password'})
        .then((res) => {
          userId = res.body.id;
          return MunchAPI.getUser(userId);
        })
        .then((res) => {
          let user = res.body;
          expect(res).to.have.status(200);
          expect(user).to.deep.equal({
            id : userId,
            email : 'jo@gmail.com'
          });
        });
    });
  });

  describe('POST /user/update/password', () => {
    let user = {email:'joeyjiron06@gmail.com', password:'password'};

    it('should return a 400 and error message when an invalid previous password is sent', () => {
      return MunchAPI.postUser(user)
        .then((res) => {
          return MunchAPI.updatePassword('thewrongpassword', 'someNewPassword', res.body.id);
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.old_password.message).to.not.be.empty;
          expect(res.body.errors.new_password).to.be.undefined;
        });
    });

    it('should return a 400 and error message when in invalid new password is sent', () => {
      return MunchAPI.postUser(user)
        .then((res) => {
          return MunchAPI.updatePassword('password', '2short', res.body.id);
        })
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.new_password.message).to.not.be.empty;
          expect(res.body.errors.old_password).to.be.undefined;
        });
    });

    it('should return a 400 with error message when given a bad user id', () => {
      return MunchAPI.updatePassword('password', 'newPassword', 'bogusIdThatDoesntExist')
        .catch((res) => {
          expect(res).to.have.status(400);
          expect(res.body.errors.id.message).to.not.be.empty;
          expect(res.body.errors.new_password).to.be.undefined;
          expect(res.body.errors.old_password).to.be.undefined;
        });
    });

    it('should return a 200 and user when password is updated properly', () => {
      let userId;
      return MunchAPI.postUser(user)
        .then((res) => {
          userId = res.body.id;
          return MunchAPI.updatePassword('password', 'newPassword', res.body.id);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body.email).to.equal('joeyjiron06@gmail.com');
          expect(res.body.id).to.equal(userId);
        });
    });
  });

  describe('GET /user/decode-email', () => {
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

    it('should return a valid token that can be used for /user/update/password', () => {
      return MunchAPI.postUser({email:'test@test.com', password:'password'})
        .then(() => MunchAPI.resetPassword('test@test.com'))
        .then((res) => {
          let {id, token} = res.body;
          return MunchAPI.updatePassword(null, 'newPassword', id, token);
        })
        .then((res) => {
          expect(res).to.have.status(200);
        })
        .catch((err) => {
          console.log('error in token', err);
        })
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