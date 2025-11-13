const Joi = require('joi');

const ApiError = require('../utils/ApiError');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const issues = error.details.map((detail) =>
        detail.message.replace(/"/g, '')
      );
      return next(new ApiError(400, 'Validation failed.', issues));
    }

    req.body = value;
    return next();
  };
};

module.exports = validate;