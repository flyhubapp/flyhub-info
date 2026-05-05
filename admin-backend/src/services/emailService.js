const transporter = require('../config/mailConfig');
const logger = require('../utils/logger');

/**
 * Service to handle all email operations with retry logic
 */
class EmailService {
  /**
   * Send a generic email with retry mechanism
   * @param {Object} mailOptions - nodemailer mail options
   * @param {number} retries - Number of retry attempts
   */
  async sendEmail(mailOptions, retries = 3) {
    const fromName = process.env.ZEPTO_FROM_NAME || 'Flyhub Info';
    const fromEmail = process.env.ZEPTO_FROM_EMAIL || 'noreply@flyhub.info';

    const finalOptions = {
      ...mailOptions,
      from: `"${fromName}" <${fromEmail}>`,
    };

    let attempt = 0;
    while (attempt < retries) {
      try {
        const info = await transporter.sendMail(finalOptions);
        logger.info(`Email sent successfully: ${info.messageId}`);
        return info;
      } catch (error) {
        attempt++;
        logger.error(`Attempt ${attempt} failed to send email: ${error.message}`);
        
        if (attempt >= retries) {
          logger.error(`Max retries reached for email to ${mailOptions.to}`);
          throw new Error(`Failed to send email after ${retries} attempts: ${error.message}`);
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Send Confirmation Email to User
   * @param {string} to - Recipient email
   * @param {string} name - Recipient name
   * @param {string} type - Submission type
   * @param {Object} details - Additional details
   */
  async sendConfirmationEmail(to, name, type, details = {}) {
    const { getConfirmationTemplate } = require('../templates/confirmationTemplate');
    
    const mailOptions = {
      to,
      subject: `Flyhub: ${type.charAt(0).toUpperCase() + type.slice(1)} Received`,
      html: getConfirmationTemplate(name, type, details)
    };

    return this.sendEmail(mailOptions);
  }
}

module.exports = new EmailService();
