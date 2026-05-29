const { body } = require('express-validator');

const createUserValidator = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').toLowerCase(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  // Optional fields validation can be added here
];

const updateUserValidator = [
  body('username').optional().trim().notEmpty().withMessage('Username cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Valid email is required').toLowerCase(),
];

module.exports = {
  createUserValidator,
  updateUserValidator
};
