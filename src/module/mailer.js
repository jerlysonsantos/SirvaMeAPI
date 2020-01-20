const path = require('path');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

const {
  host,
  port,
  user,
  pass,
} = require('../config/emailSend.json');


const transport = nodemailer.createTransport({
  host,
  port,
  auth: {
    user,
    pass,
  },
});

transport.use('compile', hbs({
  viewEngine: {
    extName: '.ejs',
    partialsDir: './src/resources/mail/',
    layoutsDir: './src/resources/mail/',
    defaultLayout: 'mail.ejs',
  },
  viewPath: path.resolve('./src/resources/mail/'),
  extName: '.ejs',
}));

module.exports = transport;
