import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import { redisClient } from '../../config/redis';

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

  res.status(dbStatus === 'UP' && redisStatus === 'UP' ? 200 : 503).json({
    success: dbStatus === 'UP' && redisStatus === 'UP',
    status: dbStatus === 'UP' && redisStatus === 'UP' ? 'healthy' : 'degraded',
    version: '1.0.0',
    services: {
      database: dbStatus,
      redis: redisStatus
    }
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
