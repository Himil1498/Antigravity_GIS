/**
 * Email Service
 * Handles sending emails for various purposes (verification, password reset, etc.)
 */

const { createTransporter } = require('./transporter');
const { sendVerificationEmail } = require('./verificationEmail');
const { sendPasswordResetEmail } = require('./passwordResetEmail');
const { send2FACode } = require('./twoFactorEmail');
const {
  sendManualVerificationNotification,
  sendAdminPasswordResetEmail
} = require('./adminEmails');
const { sendDevToolsNotification } = require('./devToolsEmail');

module.exports = {
  createTransporter,
  sendVerificationEmail,
  sendPasswordResetEmail,
  send2FACode,
  sendManualVerificationNotification,
  sendAdminPasswordResetEmail,
  sendDevToolsNotification
};
