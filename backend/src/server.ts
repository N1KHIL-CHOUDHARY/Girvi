import app from './app';
import { env } from './config/env';
import { connectRedis, disconnectRedis } from './config/redis';
import { initializeQueues } from './jobs';
import { prisma } from './config/database';
import { logger } from './common/logger';

const PORT = env.PORT || 5000;

async function bootstrap() {
  logger.info('🚀 Launching Pawn Manager Backend Server...');

  try {
    // 1. Connect to Caching Layer (Redis)
    await connectRedis();

    // 2. Initialize Background Processing Queues (BullMQ)
    initializeQueues();

    // 3. Test Database Connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✓ Connected to PostgreSQL Database successfully');

    // 4. Start HTTP Server
    const server = app.listen(PORT, () => {
      logger.info(`✓ Server running in '${env.NODE_ENV}' mode on port ${PORT}`);
      logger.info(`📊 API Documentation sandbox ready at http://localhost:${PORT}/docs`);
    });

    // Handle Graceful Shutdowns
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown procedure...`);
      
      server.close(() => {
        logger.info('HTTP server closed.');
      });

      try {
        await disconnectRedis();
        await prisma.$disconnect();
        logger.info('✓ Database and Cache connections terminated cleanly.');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'Error during graceful shutdown');
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.fatal({ error }, 'Failed to initialize server application');
    process.exit(1);
  }
}

// Global Process Event Listeners
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught Exception detected! Force exiting process...');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'Unhandled Promise Rejection detected! Force exiting process...');
  process.exit(1);
});

bootstrap();
