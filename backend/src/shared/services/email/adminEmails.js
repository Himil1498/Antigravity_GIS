const { createTransporter } = require("./transporter");

/**
 * Send manual verification notification
 * Sent when an admin manually verifies a user's email
 * @param {string} email - User's email address
 * @param {string} fullName - User's full name
 * @returns {Promise<boolean>} Success status
 */
const sendManualVerificationNotification = async (email, fullName) => {
  try {
    const appUrl = process.env.NODE_ENV === 'production'
      ? process.env.APP_URL_PROD
      : process.env.APP_URL_DEV || "http://localhost:3005";
    const loginUrl = `${appUrl}/login`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .badge { display: inline-block; padding: 8px 16px; background: #10b981; color: white; border-radius: 20px; font-weight: bold; margin: 10px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .icon { font-size: 48px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">✅</div>
              <h1>🗺️ OptiConnect GIS</h1>
              <h2>Email Verified!</h2>
            </div>
            <div class="content">
              <p>Hi <strong>${fullName}</strong>,</p>
              <p>Great news! Your email address has been verified by our admin team.</p>
              <center>
                <span class="badge">✓ Email Verified</span>
              </center>
              <p>You can now access all features of OptiConnect GIS.</p>
              <center>
                <a href="${loginUrl}" class="button">Login to Your Account</a>
              </center>
              <p>If you have any questions or need assistance, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2024 OptiConnect GIS. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
      OptiConnect GIS - Email Verified!

      Hi ${fullName},

      Great news! Your email address has been verified by our admin team.

      ✓ Email Verified

      You can now access all features of OptiConnect GIS.

      Login to your account: ${loginUrl}

      If you have any questions or need assistance, please contact our support team.

      © 2024 OptiConnect GIS. All rights reserved.
    `;

    const transporter = createTransporter();

    // If no transporter (email not configured), log to console
    if (!transporter) {
      console.log("\n📧 MANUAL VERIFICATION NOTIFICATION (Console Mode):");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`To: ${email}`);
      console.log(`Subject: Your Email Has Been Verified`);
      console.log(`Login URL: ${loginUrl}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      return true;
    }

    // Send email
    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM || '"OptiConnect GIS" <noreply@opticonnect.com>',
      to: email,
      subject: "Your Email Has Been Verified - OptiConnect GIS",
      text: textContent,
      html: htmlContent
    });

    console.log(`✅ Manual verification notification sent to ${email}`);
    console.log(`Message ID: ${info.messageId}`);

    return true;
  } catch (error) {
    console.error("Error sending manual verification notification:", error);
    throw new Error("Failed to send manual verification notification");
  }
};

/**
 * Send admin password reset notification
 * Sent when admin approves password reset and sets new password
 * @param {Object} user - User object
 * @param {String} newPassword - New password set by admin
 * @returns {Promise<boolean>} Success status
 */
const sendAdminPasswordResetEmail = async (user, newPassword) => {
  try {
    const appUrl = process.env.NODE_ENV === 'production'
      ? process.env.APP_URL_PROD
      : process.env.APP_URL_DEV || "http://localhost:3005";
    const loginUrl = `${appUrl}/login`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .password-box { background: #fff; border: 2px dashed #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .password { font-size: 24px; font-weight: bold; color: #d97706; font-family: 'Courier New', monospace; letter-spacing: 2px; }
            .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 OptiConnect GIS</h1>
              <h2>Password Reset Approved</h2>
            </div>
            <div class="content">
              <p>Hi <strong>${user.full_name || user.username}</strong>,</p>
              <p>Your password reset request has been approved by an administrator. Your new temporary password is:</p>

              <div class="password-box">
                <div class="password">${newPassword}</div>
              </div>

              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This is a temporary password</li>
                  <li>Please change it immediately after logging in</li>
                  <li>Do not share this password with anyone</li>
                  <li>Delete this email after changing your password</li>
                </ul>
              </div>

              <p>You can now log in to your account:</p>
              <center>
                <a href="${loginUrl}" class="button">Login to Your Account</a>
              </center>

              <p><strong>Your Login Details:</strong></p>
              <ul>
                <li><strong>Username:</strong> ${user.username}</li>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>Temporary Password:</strong> (shown above)</li>
              </ul>

              <p>If you did not request a password reset, please contact support immediately.</p>
            </div>
            <div class="footer">
              <p>© 2024 OptiConnect GIS. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
      OptiConnect GIS - Password Reset Approved

      Hi ${user.full_name || user.username},

      Your password reset request has been approved by an administrator.

      Your new temporary password is: ${newPassword}

      ⚠️ IMPORTANT SECURITY NOTICE:
      - This is a temporary password
      - Please change it immediately after logging in
      - Do not share this password with anyone
      - Delete this email after changing your password

      Login URL: ${loginUrl}

      Your Login Details:
      - Username: ${user.username}
      - Email: ${user.email}
      - Temporary Password: ${newPassword}

      If you did not request a password reset, please contact support immediately.

      © 2024 OptiConnect GIS. All rights reserved.
    `;

    const transporter = createTransporter();

    // If no transporter (email not configured), log to console
    if (!transporter) {
      console.log("\n📧 ADMIN PASSWORD RESET EMAIL (Console Mode):");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`To: ${user.email}`);
      console.log(`Subject: Password Reset Approved`);
      console.log(`New Password: ${newPassword}`);
      console.log(`Login URL: ${loginUrl}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      return true;
    }

    // Send email
    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM || '"OptiConnect GIS" <noreply@opticonnect.com>',
      to: user.email,
      subject: "Password Reset Approved - OptiConnect GIS",
      text: textContent,
      html: htmlContent
    });

    console.log(`✅ Admin password reset email sent to ${user.email}`);
    console.log(`Message ID: ${info.messageId}`);

    return true;
  } catch (error) {
    console.error("Error sending admin password reset email:", error);
    throw new Error("Failed to send admin password reset email");
  }
};

module.exports = {
  sendManualVerificationNotification,
  sendAdminPasswordResetEmail
};
