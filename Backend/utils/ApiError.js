class ApiError extends Error {
  constructor(statusCode, message, error) {
    super(message);
    this.statusCode = statusCode;
    if (error) {
      this.error = error;
    }
  }
}

module.exports = ApiError;

