const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const ContactMessage = require('../models/contactMessageModel');
const crmService = require('../services/crmService');

exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message, category } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message must be 2000 characters or less' });
    }

    const contactMsg = await ContactMessage.create({
      name,
      email,
      subject: subject || 'Contact Form Submission',
      message,
      category: category || 'general',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await transporter.sendMail({
          from: `"Cardly Contact" <${process.env.SMTP_USER}>`,
          to: process.env.ADMIN_EMAIL || 'admin@cardly.com',
          replyTo: email,
          subject: `[Cardly Contact] ${subject || 'New Message'}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Category:</strong> ${category || 'general'}</p>
            <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <div style="background:#f5f5f5;padding:15px;border-radius:8px;margin-top:10px">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <hr style="margin:20px 0">
            <p style="color:#666;font-size:12px">Sent from Cardly Contact Form at ${new Date().toISOString()}</p>
          `
        });
      } catch (emailErr) {
        logger.warn(`Email send failed (message saved to DB): ${emailErr.message}`);
      }
    }

    logger.info(`Contact form submitted by ${email}, saved as ${contactMsg._id}`);
    res.status(200).json({ success: true, message: 'Message sent successfully', id: contactMsg._id });
  } catch (error) {
    logger.error(`Contact form error: ${error.message}`);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
};

exports.getContacts = async (req, res, next) => {
  try {
    const result = await crmService.getAll(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
