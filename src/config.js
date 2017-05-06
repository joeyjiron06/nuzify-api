const fs = require('fs');
const {
  JWT_SECRET,
  NODE_ENV,
  PORT
} = process.env;

const config = {
  jwtSecret : JWT_SECRET || fs.readFileSync('.jwt.secret').toString(),
  port : PORT || 8080,
  nodemailer : {}
};

if (NODE_ENV === 'test') {
  config.nodemailer = {
    host: 'localhost',
    secure: false,
    ignoreTLS: true,
    port: 1025
  };
} else {
  config.nodemailer = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    secure: true,
    auth: {
      user: 'joeyjiron06@gmail.com',
      pass: fs.readFileSync('.emailpassword.secret').toString()
    }
  };
}

module.exports = config;