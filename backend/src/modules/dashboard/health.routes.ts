import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import { redisClient } from '../../config/redis';
import { getDailyDatabaseReadStatus, performDailyDatabaseRead } from '../../jobs/daily-db-reader.job';

const router = Router();

router.get('/health', async (_req: Request, res: Response): Promise<void> => {
  let dbStatus = 'UP';
  let redisStatus = 'UP';
  
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = 'DOWN';
  }

  try {
    if (redisClient.isOpen) {
      const ping = await redisClient.ping();
      if (ping !== 'PONG') {
        redisStatus = 'DOWN';
      }
    } else {
      redisStatus = 'DOWN';
    }
  } catch (err) {
    redisStatus = 'DOWN';
  }

  const isHealthy = dbStatus === 'UP' && redisStatus === 'UP';
  const isOperational = dbStatus === 'UP';
  const dailyDbReader = getDailyDatabaseReadStatus();

  res.status(isOperational ? 200 : 503).json({
    success: isOperational,
    status: isHealthy ? 'healthy' : (isOperational ? 'degraded' : 'down'),
    version: '1.0.0',
    services: {
      database: dbStatus,
      redis: redisStatus,
      dailyDbReader
    }
  });
});

router.get('/health/daily-ping', (_req: Request, res: Response): void => {
  const status = getDailyDatabaseReadStatus();
  res.status(200).json({
    success: true,
    data: status
  });
});

router.post('/health/daily-ping', async (_req: Request, res: Response): Promise<void> => {
  const result = await performDailyDatabaseRead();
  res.status(result.success ? 200 : 500).json({
    success: result.success,
    data: result
  });
});

router.get('/ready', async (_req: Request, res: Response): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).send('OK');
  } catch (err) {
    res.status(503).send('Database connection failure');
  }
});

router.get('/version', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    version: '1.0.0',
    build: process.env.BUILD_NUMBER || 'dev-build',
    nodeVersion: process.version
  });
});

export default router;
