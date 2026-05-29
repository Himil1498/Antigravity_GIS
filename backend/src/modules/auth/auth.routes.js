const express = require('express');
const router = express.Router();

const { login, verifyPassword } = require('./controllers/login.controller');
const { register } = require('./controllers/register.controller');
const { getCurrentUser, getMyRecentActivity } = require('./controllers/profile.controller');
const { logout } = require('./controllers/logout.controller');
const { changePassword } = require('./controllers/password.controller');
const { verifyEmail, resendVerificationEmail } = require('./controllers/verify.controller');
const { validateSession } = require('./controllers/session.controller'); // Fixed import name
const { refreshToken } = require('./controllers/refresh.controller');

const { authenticate } = require('../../shared/middleware/auth');
const { 
  validateLogin, 
  validateRegister, 
  validateChangePassword, 
  validateResendVerification 
} = require('./auth.validator');

// Auth Routes
router.post('/login', validateLogin, login);
router.post('/pre-login', require('./controllers/pre-login.controller').getPreLoginInfo);
router.post('/register', validateRegister, register);
router.get('/me', authenticate, getCurrentUser);
router.get('/me/recent-activity', authenticate, getMyRecentActivity);
router.post('/change-password', authenticate, validateChangePassword, changePassword);
router.post('/logout', authenticate, logout);
router.post('/refresh', refreshToken);

// Verification
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', validateResendVerification, resendVerificationEmail);

// Session
router.get('/validate-session', authenticate, validateSession);

// Token Verification
router.get('/verify', authenticate, (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: req.user
  });
});

// Password Verification (for sensitive actions)
router.post('/verify-password', authenticate, verifyPassword);

module.exports = router; // Export single router
