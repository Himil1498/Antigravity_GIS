const { pool } = require('../../../config/database');
const { sendVerificationEmail } = require('../../../shared/services/email');
const authService = require('../auth.service');
const jwt = require('jsonwebtoken');

// --- Service Logic (Inline for simplicity or move to auth.service) ---
// Moving verifyEmailTokenService logic here or to auth.service?
// It uses jwt.verify with secret. 
// Let's implement it here using env vars.

const verifyEmailTokenService = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Verification link has expired');
    }
    throw new Error('Invalid verification link');
  }
};

const markEmailAsVerified = async (userId) => {
  await pool.query(
    'UPDATE users SET is_email_verified = TRUE, email_verified_at = NOW() WHERE id = ?',
    [userId]
  );
};


const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ success: false, error: 'Verification token is required' });

    let decoded;
    try {
      decoded = verifyEmailTokenService(token);
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    const user = await authService.getUserById(decoded.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    if (user.is_email_verified) {
      return res.json({ success: true, message: 'Email is already verified', alreadyVerified: true });
    }

    await markEmailAsVerified(decoded.id);

    res.json({ success: true, message: 'Email verified successfully! You can now login.', alreadyVerified: false });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, error: 'Email verification failed. Please try again.' });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

    const user = await authService.findUserByIdentifier(email);
    // Note: findUserByIdentifier uses buildUserQuery which might be slightly different than select * needed?
    // It returns full_name, email, etc. which is sufficient.
    
    if (!user) {
        // Security: Don't reveal user existence
        return res.json({ success: true, message: 'If an account exists with this email, a verification link has been sent.' });
    }

    if (user.is_email_verified) {
      return res.json({ success: true, message: 'Email is already verified' });
    }

    try {
      // Need password for email template? Original called verify logic which expected object.
      // sendVerificationEmail(user)
      await sendVerificationEmail(user);
      console.log(`✅ Verification email resent to ${email}`);
    } catch (emailError) {
      console.error('Failed to resend verification email:', emailError);
      return res.status(500).json({ success: false, error: 'Failed to send verification email.' });
    }

    res.json({ success: true, message: 'Verification email sent! Please check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, error: 'Failed to resend verification email.' });
  }
};

module.exports = {
  verifyEmail,
  resendVerificationEmail
};
