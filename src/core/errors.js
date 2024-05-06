const escapeHtml = require('escape-html');
const { isCelebrateError } = require('celebrate');

// Definisi errorTypes dari kedua kode
const errorTypes = {
  SERVER: {
    description: 'Server error occurred',
    status: 500,
    code: 'SERVER_ERROR',
  },
  // Tambahkan error untuk batas percobaan login
  TOO_MANY_LOGIN_ATTEMPTS: {
    status: 403,
    description: 'Too many failed login attempts',
    code: 'TOO_MANY_LOGIN_ATTEMPTS_ERROR',
  },
  // Sisipkan errorTypes dari kode kedua di sini
  // ...
};

// Fungsi errorResponder dari kedua kode
const errorResponder = (errorType, message = '', validationErrors = null) => {
  const error = new Error(message);

  if (errorType) {
    error.code = errorType.code || 'UNKNOWN_ERROR';
    error.status = errorType.status || 500;
    error.description = errorType.description || 'Unknown error occurred';
  }

  if (validationErrors) {
    error.validationErrors = validationErrors;
  }

  return error;
};

// Fungsi errorHandler dari kode kedua
const errorHandler = (error, request, response, next) => {
  // Handle Joi validation error
  if (isCelebrateError(error)) {
    const validationErrors = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [segment, joiError] of error.details.entries()) {
      validationErrors.push({
        source: segment,
        keys: joiError.details.map((detail) =>
          escapeHtml(detail.path.join('.'))
        ),
        message: joiError.details.map((detail) => detail.message),
      });
    }

    // Return the error messages as an array of validation results
    return next(
      errorResponder(
        errorTypes.VALIDATION,
        'Validation error',
        validationErrors
      )
    );
  }

  return next(error);
};

module.exports = {
  errorTypes,
  errorResponder,
  errorHandler,
};
