const { generateEmailVerificationToken } = require("../../utils/jwt");
const { createTransporter } = require("./transporter");

/**
 * Send email verification email
 * @param {Object} user - User object with id, email, username
 * @returns {Promise<boolean>} Success status
 */
const sendVerificationEmail = async (user) => {
  try {
    // Generate verification token
    const verificationToken = generateEmailVerificationToken({
      id: user.id,
      email: user.email,
    });

    // Create verification URL (automatically select based on NODE_ENV)
    const appUrl =
      process.env.NODE_ENV === "production"
        ? process.env.APP_URL_PROD
        : process.env.APP_URL_DEV || "http://localhost:3005";
    const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;

    // Email HTML template
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
            .info-box { background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .info-label { font-weight: bold; color: #4b5563; }
            .info-value { color: #1f2937; }
            .credentials-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🗺️ OptiConnect GIS</h1>
              <h2>Email Verification</h2>
            </div>
            <div class="content">
              <p>Hi <strong>${user.full_name || user.username}</strong>,</p>
              <p>Thank you for registering with OptiConnect GIS! Please verify your email address to activate your account.</p>

              <p>Click the button below to verify your email:</p>
              <center>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </center>

              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #667eea;">📋 Your Account Details</h3>
                <div class="info-row">
                  <span class="info-label">Username:</span>
                  <span class="info-value">${user.username}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${user.email}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Full Name:</span>
                  <span class="info-value">${user.full_name || "N/A"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Role:</span>
                  <span class="info-value">${user.role || "viewer"}</span>
                </div>
              </div>

              <div class="credentials-box">
                <h4 style="margin-top: 0; color: #1e40af;">🔐 Login Credentials</h4>
                <p style="margin: 10px 0;"><strong>Username/Email:</strong> ${user.username} or ${user.email}</p>
                ${
                  user.password
                    ? `
                <p style="margin: 10px 0;"><strong>Password:</strong> <span style="font-family: 'Courier New', monospace; background: #fef3c7; padding: 4px 8px; border-radius: 4px; color: #b45309;">${user.password}</span></p>
                <p style="margin: 10px 0; font-size: 13px; color: #dc2626; background: #fee2e2; padding: 8px; border-radius: 4px;">
                  ⚠️ <strong>Security Notice:</strong> Please save this password securely and delete this email after logging in. Consider changing your password after first login.
                </p>
                `
                    : `
                <p style="margin: 10px 0;"><strong>Password:</strong> Use the password you set during registration</p>
                `
                }
                <p style="margin: 10px 0; font-size: 14px; color: #6b7280;">
                  <em>Note: Please verify your email first before logging in. Once verified, you can access your account using the credentials above.</em>
                </p>
              </div>

              <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>
              <p>If you didn't create an account with OptiConnect GIS, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 OptiConnect GIS. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Plain text version
    const textContent = `
      Hi ${user.full_name || user.username},

      Thank you for registering with OptiConnect GIS!

      Please verify your email address by clicking the link below:
      ${verificationUrl}

      ═══════════════════════════════════════════
      📋 YOUR ACCOUNT DETAILS
      ═══════════════════════════════════════════

      Username:   ${user.username}
      Email:      ${user.email}
      Full Name:  ${user.full_name || "N/A"}
      Role:       ${user.role || "viewer"}

      ═══════════════════════════════════════════
      🔐 LOGIN CREDENTIALS
      ═══════════════════════════════════════════

      Username/Email: ${user.username} or ${user.email}
      ${
        user.password
          ? `Password:       ${user.password}

      ⚠️ SECURITY NOTICE:
      Please save this password securely and delete this email
      after logging in. Consider changing your password after
      first login.`
          : `Password:       Use the password you set during registration`
      }

      Note: Please verify your email first before logging in.
      Once verified, you can access your account using the
      credentials above.

      ═══════════════════════════════════════════

      IMPORTANT: This verification link will expire in 24 hours.

      If you didn't create an account with OptiConnect GIS, please ignore this email.

      © 2024 OptiConnect GIS. All rights reserved.
    `;

    const transporter = createTransporter();

    // If no transporter (email not configured), log to console
    if (!transporter) {
      console.log("\n📧 EMAIL VERIFICATION (Console Mode):");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`To: ${user.email}`);
      console.log(`Subject: Verify your OptiConnect GIS account`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log("\n📋 Account Details:");
      console.log(`   Username:  ${user.username}`);
      console.log(`   Email:     ${user.email}`);
      console.log(`   Full Name: ${user.full_name || "N/A"}`);
      console.log(`   Role:      ${user.role || "viewer"}`);
      console.log("\n🔐 Login Credentials:");
      console.log(`   Username:  ${user.username}`);
      if (user.password) {
        console.log(`   Password:  ${user.password}`);
        console.log(
          `   ⚠️  Password sent in email - User should save it securely`,
        );
      } else {
        console.log(`   Password:  (Not available - resend verification)`);
      }
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      return true;
    }

    // Send email
    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM || '"OptiConnect GIS" <noreply@opticonnect.com>',
      to: user.email,
      subject: "Verify your OptiConnect GIS account",
      text: textContent,
      html: htmlContent,
    });

    console.log(`✅ Verification email sent to ${user.email}`);
    console.log(`Message ID: ${info.messageId}`);

    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

module.exports = { sendVerificationEmail };
