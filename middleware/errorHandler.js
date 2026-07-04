
const logger = require('../config/logger');


function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, path: req.originalUrl });

  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong on our end' : err.message;

  res.status(status).json({ message });
}

module.exports = errorHandler;
