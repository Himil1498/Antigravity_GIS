const { createTransporter } = require("./transporter");

/**
 * Send 2FA verification code email
 * @param {string} email - User email address
 * @param {string} name - User full name
 * @param {string} code - 6-digit verification code
 * @returns {Promise<boolean>} Success status
 */
const send2FACode = async (email, name, code) => {
  try {
    const transporter = createTransporter();

    // If no transporter (email not configured), log to console
    if (!transporter) {
      console.log("\n📧 2FA VERIFICATION CODE EMAIL (Not sent - email not configured)");
      console.log("═══════════════════════════════════════════════════════════");
      console.log(`To: ${email}`);
      console.log(`Name: ${name}`);
      console.log(`Code: ${code}`);
      console.log("═══════════════════════════════════════════════════════════\n");
      return true; // Return success for development
    }

    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0 0 10px 0; font-size: 28px; }
            .header p { margin: 0; font-size: 14px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; margin-bottom: 20px; }
            .code-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
            .code { font-size: 48px; font-weight: bold; letter-spacing: 8px; color: white; font-family: 'Courier New', monospace; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
            .code-label { color: rgba(255,255,255,0.9); font-size: 14px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; }
            .info-box { background: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 4px; }
            .info-box p { margin: 8px 0; font-size: 14px; }
            .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px; }
            .warning-box p { margin: 8px 0; font-size: 14px; color: #92400e; }
            .security-tips { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; }
            .security-tips h3 { margin-top: 0; color: #374151; font-size: 16px; }
            .security-tips ul { margin: 10px 0; padding-left: 20px; }
            .security-tips li { margin: 6px 0; font-size: 14px; color: #6b7280; }
            .footer { background: #f9fafb; padding: 30px 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
            .footer p { margin: 5px 0; }
            .footer-link { color: #667eea; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Two-Factor Authentication</h1>
              <p>OptiConnect GIS - Secure Login Verification</p>
            </div>

            <div class="content">
              <p class="greeting">Hello <strong>${name}</strong>,</p>

              <p>Someone (hopefully you!) is trying to log in to your OptiConnect GIS account. To complete the login, please enter the verification code below:</p>

              <div class="code-box">
                <div class="code-label">Your Verification Code</div>
                <div class="code">${code}</div>
              </div>

              <div class="info-box">
                <p><strong>⏱️ This code expires in 10 minutes</strong></p>
                <p>If you don't use this code within 10 minutes, you'll need to request a new one.</p>
              </div>

              <div class="warning-box">
                <p><strong>⚠️ Important Security Notice</strong></p>
                <p>If you did NOT attempt to log in, please:</p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Ignore this email and the code will expire automatically</li>
                  <li>Change your password immediately</li>
                  <li>Contact your administrator if you suspect unauthorized access</li>
                </ul>
              </div>

              <div class="security-tips">
                <h3>🛡️ Security Tips</h3>
                <ul>
                  <li>Never share this code with anyone, including OptiConnect staff</li>
                  <li>OptiConnect will never ask for your verification code via email or phone</li>
                  <li>Make sure you're on the official OptiConnect GIS website before entering the code</li>
                </ul>
              </div>
            </div>

            <div class="footer">
              <p><strong>OptiConnect GIS</strong></p>
              <p>Telecom Infrastructure Management Platform</p>
              <p style="margin-top: 15px;">
                Need help? Contact us at
                <a href="mailto:${process.env.EMAIL_USER}" class="footer-link">${process.env.EMAIL_USER}</a>
              </p>
              <p style="margin-top: 15px; color: #9ca3af;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Email text content (fallback for email clients that don't support HTML)
    const textContent = `
      OptiConnect GIS - Two-Factor Authentication

      Hello ${name},

      Someone (hopefully you!) is trying to log in to your OptiConnect GIS account.

      Your verification code is: ${code}

      This code expires in 10 minutes.

      IMPORTANT:
      - Never share this code with anyone
      - If you did NOT attempt to log in, ignore this email and change your password immediately

      Need help? Contact us at ${process.env.EMAIL_USER}

      ---
      OptiConnect GIS - Telecom Infrastructure Management Platform
    `;

    const mailOptions = {
      from: `"OptiConnect GIS Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 OptiConnect GIS - Your Verification Code",
      text: textContent,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ 2FA code sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending 2FA code email:", error);
    throw new Error("Failed to send verification code email");
  }
};

module.exports = { send2FACode };
