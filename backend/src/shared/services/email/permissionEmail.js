const { createTransporter } = require("./transporter");

/**
 * Send permission update email
 * @param {Object} user - User object with email, username
 * @param {Array} permissions - List of permission objects { code, description }
 * @param {String} action - 'assigned' | 'revoked' | 'updated'
 * @returns {Promise<boolean>} Success status
 */
const sendPermissionUpdateEmail = async (
  user,
  permissions,
  action = "updated",
  addedPermissions = [],
  removedPermissions = [],
) => {
  try {
    const transporter = createTransporter();

    // If no transporter (email not configured), log to console
    if (!transporter) {
      console.log(`\n📧 PERMISSION NOTIFICATION (Console Mode):`);
      console.log(`To: ${user.email}`);
      console.log(`Action: Permissions ${action}`);
      return true;
    }

    // Helper to generate permission badge HTML
    const generatePermHtml = (perms, color) =>
      perms
        .map(
          (p) => `
      <div style="background: #fdfdfd; padding: 12px; margin-bottom: 8px; border-radius: 6px; border-left: 4px solid ${color}; border: 1px solid #eee; border-left-width: 4px;">
        <div style="font-weight: 600; color: #374151; font-size: 14px;">${p.code}</div>
        <div style="font-size: 13px; color: #6b7280; margin-top: 2px;">${p.description || "System Feature"}</div>
      </div>
    `,
        )
        .join("");

    let contentHtml = "";

    // 1. If explicit Added/Removed lists are provided (Better UX)
    if (addedPermissions.length > 0 || removedPermissions.length > 0) {
      if (addedPermissions.length > 0) {
        contentHtml += `
          <h3 style="color: #059669; margin-top: 25px; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">✅ Access Granted</h3>
          ${generatePermHtml(addedPermissions, "#059669")}
        `;
      }

      if (removedPermissions.length > 0) {
        contentHtml += `
          <h3 style="color: #dc2626; margin-top: 25px; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">❌ Access Revoked</h3>
          ${generatePermHtml(removedPermissions, "#dc2626")}
        `;
      }
    } else {
      // 2. Fallback: Show full list (Legacy/Initial Assignment)
      const color = action === "revoked" ? "#dc2626" : "#059669";
      contentHtml += `
          <h3 style="color: #374151; margin-top: 25px; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Current Permissions</h3>
          ${generatePermHtml(permissions, color)}
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; font-family: sans-serif; }
            .header { background: #1f2937; color: white; padding: 30px 25px; text-align: center; }
            .content { padding: 30px; background: #ffffff; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin:0; font-weight: 600;">OptiConnect GIS</h2>
              <p style="margin:5px 0 0; opacity: 0.9; font-size: 14px;">Access Control Notification</p>
            </div>
            <div class="content">
              <p style="font-size: 16px;">Hello <strong>${user.full_name || user.username}</strong>,</p>
              <p style="color: #4b5563;">Your system access permissions have been updated by an administrator.</p>
              
              ${contentHtml}

              <p style="margin-top: 30px; font-size: 14px; color: #6b7280; background: #f9fafb; padding: 15px; border-radius: 8px;">
                <strong>Note:</strong> You may need to refresh your browser or log out and log back in for these changes to take full effect.
              </p>
              
              <center style="margin-top: 30px;">
                <a href="${process.env.APP_URL_PROD || "http://localhost:3005"}" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Open Dashboard</a>
              </center>
            </div>
            <div class="footer">
              <p>This is an automated security notification.</p>
              <p>© ${new Date().getFullYear()} OptiConnect GIS</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from:
        process.env.EMAIL_FROM || '"OptiConnect GIS" <noreply@opticonnect.com>',
      to: user.email,
      subject: `[Access Update] Permissions Updated`,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error("Error sending permission email:", error);
    return false;
  }
};

module.exports = { sendPermissionUpdateEmail };
