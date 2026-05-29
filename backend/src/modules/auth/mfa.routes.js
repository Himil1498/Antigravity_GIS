const express = require('express');
const router = express.Router();

const { 
  get2FAStatus, 
  enable2FA, 
  verifyAndEnable2FA, 
  disable2FA, 
  send2FACodeForLogin, 
  verify2FACode, 
  adminForce2FA, 
  adminDisable2FA 
} = require('./controllers/mfa.controller');

const { authenticate } = require('../../shared/middleware/auth');

// MFA Routes
router.get('/status', authenticate, get2FAStatus);
router.post('/enable', authenticate, enable2FA);
router.post('/verify-and-enable', authenticate, verifyAndEnable2FA);
router.post('/disable', authenticate, disable2FA);
router.post('/send-code', send2FACodeForLogin);
router.post('/verify', verify2FACode);

// Admin
router.post('/admin/force-enable/:userId', authenticate, adminForce2FA);
router.post('/admin/disable/:userId', authenticate, adminDisable2FA);

module.exports = router;
