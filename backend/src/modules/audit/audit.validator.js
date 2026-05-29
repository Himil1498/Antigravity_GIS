const { body, query, param } = require('express-validator');
const validateRequest = require('../../shared/middleware/validateRequest');

const validateCreateAuditLog = [
  body('action')
    .trim()
    .notEmpty()
    .withMessage('Action is required'),
  body('resource_type')
    .optional()
    .trim(),
  validateRequest
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validateRequest
];

const validateDays = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
  validateRequest
];

module.exports = {
  validateCreateAuditLog,
  validatePagination,
  validateDays
};
