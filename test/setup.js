const chai = require('chai');
const chaiHttp = require('chai-http');
const prepare = require('mocha-prepare');
const MockMongoose = require('./lib/mock-mongoose');

chai.use(chaiHttp);

process.env.JWT_SECRET = 'test_secret';
process.env.NODE_ENV = 'test';

// before tests run start start mongodb process which allows mongoose to connect to it
prepare(function (done) {
  MockMongoose.initialize().then(() => done());
});