import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';

// Middleware Imports
import { tenantMiddleware } from './common/middleware/tenant.middleware';
import { loggerMiddleware } from './common/middleware/logger.middleware';
import { sanitizeMiddleware } from './common/middleware/sanitize.middleware';
import { errorMiddleware } from './common/middleware/error.middleware';
import { notFoundMiddleware } from './common/middleware/notFound.middleware';
import { apiRateLimiter } from './common/middleware/rateLimiter.middleware';

// Router Imports
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

// Scalar / OpenAPI Import
import { apiReference } from '@scalar/express-api-reference';

const app = express();

// 1. Basic Security Headers (Helmet) & CORS setup
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading uploaded images directly in client browser
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// 2. Request parsing and compression
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// 3. Request Logging (Morgan for console and Pino Http for request tracing)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(loggerMiddleware);

// 4. Custom Sanitizer Middleware
app.use(sanitizeMiddleware);

// 5. Serve static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'storage', 'uploads')));

// 6. Tenant Context Storage Middleware (Run AsyncLocalStorage mapping before routes)
app.use(tenantMiddleware);

// 7. Scalar OpenAPI Documentation sandbox
app.use(
  '/docs',
  apiReference({
    spec: {
      url: '/openapi.json'
    }
  })
);

// 8. OpenAPI Specs JSON route
app.get('/openapi.json', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'docs', 'swagger.json'), (err) => {
    if (err) {
      res.status(404).json({ success: false, message: 'OpenAPI description file not generated yet' });
    }
  });
});

// 9. Versioned API Route Mappings
const apiPrefix = '/api/v1';

// Public/Auth routes
app.use(`${apiPrefix}/auth`, authRouter);

// Core Pawnshop manager features (Rate limited)
app.use(`${apiPrefix}/app`, apiRateLimiter);
app.use(`${apiPrefix}/app`, profileRouter); // GET /app/me, PUT /app/users/preferences
app.use(`${apiPrefix}/app/customers`, customerRouter);
app.use(`${apiPrefix}/app/pawns`, pawnRouter);
app.use(`${apiPrefix}/app/payments`, paymentRouter);
app.use(`${apiPrefix}/app/employees`, employeeRouter);
app.use(`${apiPrefix}/app/roles`, roleRouter);
app.use(`${apiPrefix}/app/stat`, dashboardRouter); // GET /app/stat/dashboard
app.use(`${apiPrefix}/app/stat`, reportsRouter);   // GET /app/stat/financial-report
app.use(`${apiPrefix}/app/upload`, uploadRouter);

// Health check endpoints mounted outside rate limits
app.use('/', healthRouter); // /health, /ready, /version

// 10. 404 Routing Fallback
app.use(notFoundMiddleware);

// 11. Centralized JSON Error Handler Middleware
app.use(errorMiddleware);

export default app;
