const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.ZEPTO_HOST || 'smtp.zeptomail.in',
  port: process.env.ZEPTO_PORT || 587,
  secure: process.env.ZEPTO_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.ZEPTO_USER || 'emailapikey',
    pass: process.env.ZEPTO_PASS
  }
});

module.exports = transporter;
