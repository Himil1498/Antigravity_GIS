const { createTransporter } = require("./transporter");

/**
 * Send developer tools completion notification to admin
 * @param {Object} params - Notification parameters
 * @param {string} params.toolType - Type of tool (code_analysis, security_scan, database_backup, etc.)
 * @param {string} params.reportType - Specific report type (frontend, props_analysis, full, etc.)
 * @param {string} params.status - Status (completed, failed)
 * @param {number} params.duration - Duration in seconds
 * @param {Object} params.stats - Statistics object
 * @param {string} params.errorMessage - Error message if failed
 * @param {string} params.adminEmail - Admin email address
 * @param {string} params.adminName - Admin name
 * @returns {Promise<boolean>} Success status
 */
const sendDevToolsNotification = async ({
  toolType,
  reportType,
  status,
  duration,
  stats = {},
  errorMessage = null,
  adminEmail,
  adminName
}) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log(`📧 [DEV MODE] Would send ${toolType} notification to ${adminEmail}`);
      return true;
    }

    // Format tool type for display
    const toolLabels = {
      code_analysis: "Code Analysis",
      security_scan: "Security Scan",
      database_backup: "Database Backup",
      env_validation: "Environment Validation"
    };

    const reportLabels = {
      frontend: "Frontend Analysis",
      fullstack: "Fullstack Analysis",
      architecture: "Architecture Docs",
      dependency_graph: "Dependency Graph",
      hierarchy: "Component Hierarchy",
      props_analysis: "Props Analysis",
      api_analysis: "API Performance Analysis",
      full: "Full Security Scan",
      dependencies: "Dependencies Scan",
      code: "Code Security Scan",
      config: "Configuration Scan"
    };

    const toolLabel = toolLabels[toolType] || toolType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const reportLabel = reportLabels[reportType] || reportType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Generate stats HTML
    let statsHTML = '';
    if (status === 'completed' && Object.keys(stats).length > 0) {
      statsHTML = `
        <div class="info-box">
          <h3 style="margin-top: 0; color: #10b981;">📊 Report Statistics</h3>
          ${Object.entries(stats).map(([key, value]) => `
            <div class="info-row">
              <span class="info-label">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
              <span class="info-value">${value}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Generate status-specific content
    const statusIcon = status === 'completed' ? '✅' : '❌';
    const statusColor = status === 'completed' ? '#10b981' : '#ef4444';
    const statusText = status === 'completed' ? 'Completed Successfully' : 'Failed';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .status-badge { display: inline-block; padding: 8px 16px; background: ${statusColor}; color: white; border-radius: 20px; font-weight: bold; margin: 10px 0; }
            .info-box { background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .info-label { font-weight: bold; color: #4b5563; }
            .info-value { color: #1f2937; }
            .error-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; color: #991b1b; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🗺️ OptiConnect GIS</h1>
              <h2>Developer Tools Notification</h2>
            </div>
            <div class="content">
              <p>Hi <strong>${adminName}</strong>,</p>

              <div style="text-align: center;">
                <h2 style="color: ${statusColor};">${statusIcon} ${toolLabel}</h2>
                <span class="status-badge">${statusText}</span>
              </div>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #667eea;">📋 Task Details</h3>
                <div class="info-row">
                  <span class="info-label">Tool:</span>
                  <span class="info-value">${toolLabel}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Report Type:</span>
                  <span class="info-value">${reportLabel}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Status:</span>
                  <span class="info-value" style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
                </div>
                ${duration ? `
                <div class="info-row">
                  <span class="info-label">Duration:</span>
                  <span class="info-value">${duration < 60 ? duration + 's' : Math.floor(duration / 60) + 'm ' + (duration % 60) + 's'}</span>
                </div>
                ` : ''}
              </div>

              ${statsHTML}

              ${errorMessage ? `
              <div class="error-box">
                <strong>❌ Error Details:</strong><br>
                ${errorMessage}
              </div>
              ` : ''}

              <p style="margin-top: 30px;">
                ${status === 'completed'
                  ? 'The report is now available in the Developer Tools section of the admin dashboard.'
                  : 'Please check the Developer Tools section for more details about this failure.'}
              </p>

              <p style="font-size: 12px; color: #666; margin-top: 20px;">
                This is an automated notification from OptiConnect GIS Developer Tools.
              </p>
            </div>
            <div class="footer">
              <p>OptiConnect GIS - Telecom Infrastructure Management Platform</p>
              <p>© 2025 OptiConnect. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: `"OptiConnect GIS" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `${statusIcon} ${toolLabel} - ${statusText}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Developer tools notification sent to ${adminEmail}`);
    return true;

  } catch (error) {
    console.error("❌ Error sending developer tools notification:", error);
    // Don't throw error - email failure shouldn't break the analysis
    return false;
  }
};

module.exports = { sendDevToolsNotification };
