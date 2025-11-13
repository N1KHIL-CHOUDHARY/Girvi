const sendSuccess = (res, { status = 200, message, data, meta }) => {
  const payload = { success: true, message };

  if (typeof data !== 'undefined') {
    payload.data = data;
  }

  if (meta) {
    payload.meta = meta;
  }

  return res.status(status).json(payload);
};

const sendError = (res, { status = 500, message, error }) => {
  const payload = { success: false, message };

  if (typeof error !== 'undefined') {
    payload.error = error;
  }

  return res.status(status).json(payload);
};

module.exports = {
  sendSuccess,
  sendError,
};

