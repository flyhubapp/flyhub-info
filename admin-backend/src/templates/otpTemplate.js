const getOTPTemplate = (otp, name = 'Valued User') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
        }
        .header h1 {
          color: #2d3436;
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px 0;
          text-align: center;
        }
        .otp-box {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          display: inline-block;
          margin: 20px 0;
          border: 1px dashed #0984e3;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 5px;
          color: #0984e3;
          margin: 0;
        }
        .footer {
          text-align: center;
          color: #636e72;
          font-size: 12px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
        }
        .highlight {
          color: #d63031;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Flyhub Security Verification</h1>
        </div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Your one-time password (OTP) for account verification is:</p>
          <div class="otp-box">
            <p class="otp-code">${otp}</p>
          </div>
          <p>This code will expire in <span class="highlight">10 minutes</span>.</p>
          <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Flyhub Info. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { getOTPTemplate };
