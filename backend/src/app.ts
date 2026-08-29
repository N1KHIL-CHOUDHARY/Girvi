import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';

import { tenantMiddleware } from './common/middleware/tenant.middleware';
import { loggerMiddleware } from './common/middleware/logger.middleware';
import { sanitizeMiddleware } from './common/middleware/sanitize.middleware';
import { errorMiddleware } from './common/middleware/error.middleware';
import { notFoundMiddleware } from './common/middleware/notFound.middleware';
import { apiRateLimiter } from './common/middleware/rateLimiter.middleware';

import authRouter from './modules/auth/auth.routes';
import customerRouter from './modules/customer/customer.routes';
import pawnRouter from './modules/pawn/pawn.routes';
import paymentRouter from './modules/payment/payment.routes';
import employeeRouter from './modules/employee/employee.routes';
import roleRouter from './modules/role/role.routes';
import dashboardRouter from './modules/dashboard/dashboard.routes';
import reportsRouter from './modules/reports/reports.routes';
import profileRouter from './modules/employee/profile.routes';
import uploadRouter from './modules/upload/upload.routes';
import healthRouter from './modules/dashboard/health.routes';
import searchRouter from './modules/search/search.routes';

import { apiReference } from '@scalar/express-api-reference';

const app = express();

// Enable trust proxy for reverse proxies (Render, Cloudflare, Nginx, Heroku, etc.)
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(loggerMiddleware);

app.use(sanitizeMiddleware);

app.use('/uploads', express.static(path.join(process.cwd(), 'storage', 'uploads')));

app.use(tenantMiddleware);

app.use(
  '/docs',
  apiReference({
    spec: {
      url: '/openapi.json'
    }
  })
);

app.get('/openapi.json', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'docs', 'swagger.json'), (err) => {
    if (err) {
      res.status(404).json({ success: false, message: 'OpenAPI description file not generated yet' });
    }
  });
});

const apiPrefix = '/api/v1';

app.use(`${apiPrefix}/auth`, authRouter);

app.use(`${apiPrefix}/app`, apiRateLimiter);
app.use(`${apiPrefix}/app/profile`, profileRouter);
app.use(`${apiPrefix}/app/customers`, customerRouter);
app.use(`${apiPrefix}/app/pawns`, pawnRouter);
app.use(`${apiPrefix}/app/payments`, paymentRouter);
app.use(`${apiPrefix}/app/employees`, employeeRouter);
app.use(`${apiPrefix}/app/roles`, roleRouter);
app.use(`${apiPrefix}/app/stat`, dashboardRouter);
app.use(`${apiPrefix}/app/reports`, reportsRouter);
app.use(`${apiPrefix}/app/upload`, uploadRouter);
app.use(`${apiPrefix}/app/search`, searchRouter);

app.use('/', healthRouter);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;
