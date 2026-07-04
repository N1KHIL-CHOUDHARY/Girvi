import axios from 'axios';
import cron from 'node-cron';
import dotenv from 'dotenv';
import app from './app.js';
import { prisma } from './config/prisma.js';

dotenv.config();

const port = Number(process.env.PORT ?? 5000);

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('Database connected.');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    const allowedOrigins = [process.env.FRONTEND_URL,"http://localhost:5173","http://localhost:3000"].filter(Boolean);
    console.log('Allowed Origins:', allowedOrigins);
  });

  cron.schedule('*/15 * * * *', async () => {
    try {
      const url = process.env.BACKEND_URL || `http://localhost:${port}`;
      await axios.get(`${url}/`);
    } catch {
      return;
    }
  });
};

const shutdown = async (): Promise<void> => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', () => {
  void shutdown();
});

process.on('SIGTERM', () => {
  void shutdown();
});

void startServer();
