const { ZodError } = require('zod');
const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Replace with validated data to strip out extra fields
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
      return next(new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400));
    }
    next(error);
  }
};

module.exports = validate;
