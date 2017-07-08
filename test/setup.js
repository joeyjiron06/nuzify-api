const chai = require('chai');
const chaiHttp = require('chai-http');
const prepare = require('mocha-prepare');
const MockMongoose = require('./lib/mock-mongoose');

chai.use(chaiHttp);

process.env.JWT_SECRET = 'test_secret';
process.env.NODE_ENV = 'test';

// before tests run start start mongodb process which allows mongoose to connect to it
prepare(function (done) {
  if (process.env.CI) {
    // When running on TRAVIS_CI we start the service in the travis.yml file 
    // so no need to "initialize" meaning starting a mongodb server because
    // it will be done for us :)
    console.log('running in CI mode. not initializing mongodb');
    done();
    return;
  }

  console.log('initializing mongodb...');
  MockMongoose.initialize()
    .then(() => {
      console.log('DONE initializing mongodb');
      done();
    })
    .catch((err) => {
      console.error('error initializing mongodb');
      throw err;
    });
});