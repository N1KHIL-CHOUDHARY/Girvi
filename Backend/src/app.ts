import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import { sendError } from './lib/http.js';
import authRoutes from './features/auth/auth.routes.js';
import appRoutes from './features/app/app.routes.js';

dotenv.config();

const app = express();
const allowedOrigins = [process.env.FRONTEND_URL,"http://localhost:5173","http://localhost:3000"].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.send('PawnManager API is running...');
});

app.get('/api/v1', (_req, res) => {
  res.json({ message: 'Welcome to PawnManager API v1' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/app', appRoutes);

app.use((_req, res) => {
  sendError(res, { status: 404, message: 'Route not found.' });
});

app.use(errorHandler);

export default app;
