const emailService = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * Controller for Email Endpoints
 */
const sendEmail = async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    if (!to || (!html && !text)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient email and content (HTML or Text) are required.' 
      });
    }

    const info = await emailService.sendEmail({ to, subject, html, text });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    logger.error(`Controller Error [sendEmail]: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal server error while sending email.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  sendEmail
};
