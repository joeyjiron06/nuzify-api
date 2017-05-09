const { expect } = require('chai');
const mongoose = require('mongoose');
const MockMongoose = require('../../lib/mock-mongoose');
const User = require('../../../src/models/user');

/**
 * User model Tests
 * These are integration tests, testing the methods on mongoose.
 * For testing purposes we only use an in memory database and connect to it
 *
 */
describe('User Model', () => {
  let user;

  before(() => {
    return MockMongoose.connect();
  });

  after(() => {
    return MockMongoose.disconnect();
  });

  beforeEach(() => {
    return MockMongoose.clear();
  });

  describe('save', () => {

    it('should return a promise',  () => {
      user = new User({email:'what@what.com', password:'password'});
      expect(user.save()).to.be.instanceOf(Promise);
    });

    it('should return an error if no email supplied', () => {
      user = new User({});
      return user.save().catch((err) => {
          expect(err.errors.email).to.be.an.error;
          expect(err.errors.email.message).to.be.definded;
       });
    });

    it('should return an error if email is not an email format', () => {
      user = new User({email:'whatIsThisItsNotAnEmail', password:'password'});
      return user.save().catch((err) => {
        expect(err.errors.email).to.be.an.error;
        expect(err.errors.email.message).to.be.definded;
      });
    });

    it('should return a error if no password is given', () => {
      user = new User({email:'joeyjiron06@gmail.com'});
      return user.save().catch((err) => {
        expect(err.errors.password).to.be.an.error;
        expect(err.errors.password.message).to.be.defined;
      });
    });

    it('should return an invalid password error if its less than 8 chars', () => {
      user = new User({email:'joeyjiron06@gmail.com', password:'1234567'});
      return user.save().catch((err) => {
        expect(err.errors.password).to.be.an.error;
        expect(err.errors.password.message).to.not.be.empty;
      });
    });

    it('should return an error if the user already exists', () => {
      return new User({email:'joeyjiron06@gmail.com', password:'password'}).save()
        .then((user) => {
          return new User({email:'joeyjiron06@gmail.com', password:'someotherpassword'}).save();
        })
        .then((user) => {
          throw new Error('promise should be rejected when trying to add a user for a second time');
        })
        .catch((err) => {
          expect(err.code).to.equal(11000);
        });
    });

    it('should save a user with a valid email and password', () => {
      return new User({email:'joeyjiron06@gmail.com', password:'password'}).save()
        .then((user) => {
          expect(user).to.be.an.object;
          expect(user.email).to.equal('joeyjiron06@gmail.com');

          return User.find({});
        })
        .then((foundUsers) => {
          expect(foundUsers).to.have.length(1);
          expect(foundUsers[0].email).to.equal('joeyjiron06@gmail.com');
        });
    });

    it('should be able to save multiple users', () => {
      return new User({email:'barbarastreisand@gmail.com', password:'password'}).save()
        .then((user) => {
          return new User({email:'bobsagat@gmail.com', password:'password'}).save();
        })
        .then((user) => {
          return User.find({});
        })
        .then((users) => {
          expect(users).to.have.length(2);
        });
    });

    it('should not save clear text password', () => {
      return new User({email:'joeyjiron06@gmail.com', password:'secret1234'}).save()
        .then((user) => {
          expect(user.password).to.not.equal('secret1234');
        });
    });
  });

  describe('comparePassword', () => {
    it('should return true if password is correct', () => {
      user = new User({email:'what@what.com', password:'password'});
      return user.save()
        .then(() => user.comparePassword('password'))
        .then((isPasswordMatch) => {
          expect(isPasswordMatch, 'good password should return true').to.be.true;
        });
    });

    it('should return false if password is incorrect', () => {
      user = new User({email:'what@what.com', password:'password'});
      return user.save()
        .then(() => user.comparePassword('notCorrectPass'))
        .then((isPasswordMatch) => {
          expect(isPasswordMatch, 'bad password should return false').to.be.false;
        });
    });
  });
});
