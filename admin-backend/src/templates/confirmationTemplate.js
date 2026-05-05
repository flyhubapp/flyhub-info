const getConfirmationTemplate = (name, type, details = {}) => {
  const titles = {
    contact: 'We\'ve Received Your Inquiry',
    franchise: 'Franchise Application Received',
    appAccess: 'App Access Request Received',
    registration: 'Registration Received'
  };

  const messages = {
    contact: 'Thank you for reaching out to Flyhub. Our experts are reviewing your inquiry and will get back to you within 24 hours.',
    franchise: 'We are excited about your interest in joining the Flyhub franchise network. Our expansion team will review your application and contact you soon.',
    appAccess: 'Your request to access the Flyhub ecosystem app has been received. We are processing your request and will notify you once access is granted.',
    registration: `Thank you for registering as a ${details.role || 'user'} on Flyhub. Your account is currently under verification.`
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .container { font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; }
        .header { text-align: center; background: #020617; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; line-height: 1.6; color: #334155; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        .btn { display: inline-block; padding: 12px 24px; background: #0f172a; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .details-box { background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Flyhub Info</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>${messages[type] || 'Thank you for your submission.'}</p>
          
          <div class="details-box">
            <p><strong>Submission Type:</strong> ${titles[type] || type}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span style="color: #059669;">Pending Review</span></p>
          </div>

          <p>If you have any urgent questions, feel free to reply to this email or contact us at +91 91507 39434.</p>
          
          <a href="https://flyhub.info" class="btn">Visit Website</a>
        </div>
        <div class="footer">
          <p>&copy; 2026 Flyhub Info. All rights reserved.</p>
          <p>Manikampalayam, Namakkal, Tamil Nadu, India.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { getConfirmationTemplate };
