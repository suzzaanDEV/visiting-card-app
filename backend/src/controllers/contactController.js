const logger = require('../utils/logger');
const ContactMessage = require('../models/contactMessageModel');
const crmService = require('../services/crmService');
const { sendEmail } = require('../utils/emailService');
const { renderContactNotification } = require('../utils/emailTemplates');

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

    if (process.env.EMAIL_ENABLED === 'true') {
      try {
        const emailResult = await sendEmail({
          to: process.env.ADMIN_EMAIL || 'admin@cardly.com',
          replyTo: email,
          subject: `[Cardly Contact] ${subject || 'New Message'}`,
          html: renderContactNotification({
            name,
            email,
            category: category || 'general',
            subject: subject || 'N/A',
            message
          })
        });
        if (emailResult?.simulated) {
          logger.warn('Contact notification email simulated (EMAIL_ENABLED=false)');
        }
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
