const dotenv = require('dotenv');

// process the .env file which assigns process.env vars.
dotenv.config();

const config = {
  jwtSecret : process.env.JWT_SECRET,
  port : parseInt(process.env.SERVER_PORT) || 8080,
  nodemailer : {
    service: process.env.NODE_MAILER_SERVICE,
    host: process.env.NODE_MAILER_HOST,
    secure: true,
    auth: {
      user: process.env.NODE_MAILER_EMAIL,
      pass: process.env.NODE_MAILER_EMAIL_PASSWORD
    }
  }
};

module.exports = config;