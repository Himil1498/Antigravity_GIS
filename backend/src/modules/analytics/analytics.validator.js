const { body, query } = require('express-validator');
const validateRequest = require('../../shared/middleware/validateRequest');

const validateTrackEvent = [
  body('event')
    .trim()
    .notEmpty()
    .withMessage('Event name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Event name must be between 1 and 100 characters'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Event data must be an object'),
  validateRequest
];

const validateTimeRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Invalid start date'),
  query('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Invalid end date'),
  validateRequest
];

const validateLimit = [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .toInt()
      .withMessage('Limit must be between 1 and 100'),
    validateRequest
  ];

module.exports = {
  validateTrackEvent,
  validateTimeRange,
  validateLimit
};
