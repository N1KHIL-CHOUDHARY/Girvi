import pino from 'pino';
import { tenantContext } from '../context/tenant.context';
import { env } from '../../config/env';

const isDev = env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'yyyy-mm-dd HH:MM:ss.l'
        }
      }
    : undefined,
  mixin() {
    const store = tenantContext.getStore();
    if (store) {
      return {
        requestId: store.requestId,
        shopId: store.shopId,
        userId: store.userId
      };
    }
    return {};
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  }
});

export default logger;
