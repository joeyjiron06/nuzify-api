
const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = nodemailer.createTransport(config.nodemailer);

/**
 * @param {object} email
 * @param {string} email.from - who to send it from
 * @param {string} email.to - who to send it to
 * @param {string} email.subject - the subject of the email
 * @param {string} [email.text] - the body text of the email
 * @param {string} [email.html] - the body text of the email as HTML
 */
exports.sendEmail = function(email) {
  transporter.sendMail(email, (err) => {
    if (err) {
      // TODO report an error here
      // console.error(err);
    }
  });
};