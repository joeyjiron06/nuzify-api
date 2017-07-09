const chai = require('chai');
const chaiHttp = require('chai-http');
const prepare = require('mocha-prepare');
const MockMongoose = require('./lib/mock-mongoose');
const config = require('../src/config');

chai.use(chaiHttp);

prepare(function (done) {

  // change the config for testing
  config.jwtSecret = 'testsecret';
  config.nodemailer = {
    host: 'localhost',
    secure: false,
    ignoreTLS: true,
    port: 1025
  };

  if (process.env.CI) {
    // When running on TRAVIS_CI we start the service in the travis.yml file 
    // so no need to "initialize" meaning starting a mongodb server because
    // it will be done for us :)
    console.log('running in CI mode. not initializing mongodb');
    done();
  } else {
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
  }
});