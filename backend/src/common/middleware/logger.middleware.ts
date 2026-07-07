import pinoHttp from 'pino-http';
import { logger } from '../logger';
import { v4 as uuidv4 } from 'uuid';

export const loggerMiddleware = pinoHttp({
  logger,
  genReqId: (req) => {
    // Align with x-request-id from tenantMiddleware
    return (req.headers['x-request-id'] as string) || uuidv4();
  },
  customSuccessMessage: (req, res, responseTime) => {
    return `${req.method} ${req.url} -> ${res.statusCode} (${responseTime}ms)`;
  },
  customErrorMessage: (req, _res, err) => {
    return `${req.method} ${req.url} failed: ${err.message}`;
  },
  customAttributeKeys: {
    reqId: 'requestId'
  }
});

export default loggerMiddleware;
