// File Path: /utils/logger.js

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

// Custom format to redact sensitive information
const sensitiveFields = ['authorization', 'stripe-signature', 'x-webhook-signature', 'x-webhook-secret', 'email'];

const redactFormat = format((info) => {
  if (info.headers) {
    sensitiveFields.forEach(field => {
      if (info.headers[field]) {
        info.headers[field] = '***REDACTED***';
      }
    });
  }
  if (info.body && info.body.email) {
    info.body.email = '***REDACTED***';
  }
  if (info.email) {
    info.email = '***REDACTED***';
  }
  return info;
});

const customFormat = combine(
  timestamp(),
  redactFormat(),
  printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${JSON.stringify(meta)}`;
  })
);

const logger = createLogger({
  level: 'info',
  format: customFormat,
  transports: [
    new transports.Console(),
    // Add other transports like File if needed
  ],
});

module.exports = logger;
