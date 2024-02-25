const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

const catchAsync = require('./catchAsync');
// create class Email with property to , firsrname , url , from
// using this class :   new Email(user,url).sendWelcome()  user include username and user email address
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.from = `khai nguyen ${process.env.EMAIL_FROM}`;
  }
  newTranport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // render html
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstname: this.firstname,
        url: this.url,
        subject,
      },
    );
    // define mail options
    const mailOption = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };
    // send mail
    return await this.newTranport().sendMail(mailOption);
  }

  async sendWelcome() {
    return await this.send('welcome', 'Welcome to tour app ');
  }

  async sendResetPassword() {
    return await this.send('reset-password', 'Token to reset password');
  }
};
