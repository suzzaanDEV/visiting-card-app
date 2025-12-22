const nodemailer = require('nodemailer');
const logger = require('./logger');
const config = require('../../config/enterprise.config');

// Create transporter only if SMTP env is set
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    // Fallback: log email content for environments without SMTP
    logger.warn('SMTP not configured. Logging email instead of sending.', { to, subject });
    console.log('--- EMAIL (not sent, SMTP not configured) ---');
    console.log('To:', to);
    console.log('Subject:', subject);
    if (text) console.log('Text:', text);
    if (html) console.log('HTML:', html);
    console.log('--------------------------------------------');
    return { simulated: true };
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@cardly.app',
    to,
    subject,
    text,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  logger.info('Email sent', { to, subject, messageId: info.messageId });
  return info;
}

module.exports = {
  sendEmail
};

