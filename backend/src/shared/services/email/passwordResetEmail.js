const { createTransporter } = require("./transporter");

/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {String} resetToken - Password reset token
 * @returns {Promise<boolean>} Success status
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    // Auto-select URL based on NODE_ENV
    const appUrl = process.env.NODE_ENV === 'production'
      ? process.env.APP_URL_PROD
      : process.env.APP_URL_DEV || "http://localhost:3005";
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🗺️ OptiConnect GIS</h1>
              <h2>Password Reset Request</h2>
            </div>
            <div class="content">
              <p>Hi <strong>${user.username}</strong>,</p>
              <p>You requested to reset your password. Click the button below to reset it:</p>
              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              <p><strong>Note:</strong> This link will expire in 1 hour.</p>
              <p>If you didn't request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 OptiConnect GIS. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const transporter = createTransporter();

    if (!transporter) {
      console.log("\n📧 PASSWORD RESET EMAIL (Console Mode):");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`To: ${user.email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      return true;
    }

    await transporter.sendMail({
      from:
        process.env.EMAIL_FROM || '"OptiConnect GIS" <noreply@opticonnect.com>',
      to: user.email,
      subject: "Reset your OptiConnect GIS password",
      html: htmlContent
    });

    console.log(`✅ Password reset email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

module.exports = { sendPasswordResetEmail };
