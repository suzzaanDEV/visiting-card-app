const nodemailer = require('nodemailer');
const logger = require('./logger');
const { renderOtp, renderBroadcast, renderGeneric } = require('./emailTemplates');

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

async function sendEmail({ to, subject, html, text, replyTo }) {
  const isEmailEnabled = process.env.EMAIL_ENABLED === 'true';

  if (!isEmailEnabled) {
    logger.warn('Email sending disabled by EMAIL_ENABLED=false', { to, subject });
    return { simulated: true, reason: 'email_disabled' };
  }

  if (!transporter) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_PORT.');
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@cardly.app',
    to,
    subject,
    text,
    html,
    ...(replyTo ? { replyTo } : {})
  };

  const info = await transporter.sendMail(mailOptions);
  logger.info('Email sent', { to, subject, messageId: info.messageId });
  return info;
}

module.exports = {
  sendEmail
};

