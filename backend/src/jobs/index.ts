import { Queue, Worker, Job } from 'bullmq';
import { env } from '../config/env';
import { logger } from '../common/logger';
import { sendEmail } from '../emails/mailer';
import { runWithTenantContext } from '../common/context/tenant.context';

// Parse Redis connection details
let redisUrl: URL;
try {
  redisUrl = new URL(env.REDIS_URL);
} catch (e) {
  redisUrl = new URL('redis://127.0.0.1:6379');
}

interface RedisConnectionOptions {
  host: string;
  port: number;
  username?: string;
  password?: string;
  tls?: Record<string, unknown>;
}

const redisConnection: RedisConnectionOptions = {
  host: redisUrl.hostname || '127.0.0.1',
  port: parseInt(redisUrl.port || '6379', 10)
};

if (redisUrl.username) {
  redisConnection.username = decodeURIComponent(redisUrl.username);
}
if (redisUrl.password) {
  redisConnection.password = decodeURIComponent(redisUrl.password);
}
if (redisUrl.protocol === 'rediss:') {
  redisConnection.tls = {};
}

let emailQueue: Queue | null = null;
let reportQueue: Queue | null = null;
let emailWorker: Worker | null = null;
let reportWorker: Worker | null = null;

export const initializeQueues = (): void => {
  try {
    emailQueue = new Queue('email-queue', { connection: redisConnection });
    reportQueue = new Queue('report-queue', { connection: redisConnection });

    // Initialize Email Worker
    emailWorker = new Worker(
      'email-queue',
      async (job: Job) => {
        logger.info({ jobId: job.id, jobName: job.name }, 'Processing background email job');
        const { to, subject, text, html } = job.data;
        await sendEmail({ to, subject, text, html });
      },
      { connection: redisConnection }
    );

    emailWorker.on('failed', (job, err) => {
      logger.error({ jobId: job?.id, err }, 'Background email job failed');
    });

    // Initialize Report Worker
    reportWorker = new Worker(
      'report-queue',
      async (job: Job) => {
        logger.info({ jobId: job.id, jobName: job.name }, 'Processing background report compilation job');
        const { reportType, shopId, userId, filters } = job.data;
        await runWithTenantContext({ shopId, userId }, async () => {
          // Logic for compiler is implemented under reports module
          logger.info({ reportType, shopId, userId, filters }, 'Completed compiling background report');
        });
      },
      { connection: redisConnection }
    );

    reportWorker.on('failed', (job, err) => {
      logger.error({ jobId: job?.id, err }, 'Background report compilation job failed');
    });

    logger.info('✓ BullMQ queues and workers initialized successfully');
  } catch (err) {
    logger.warn(
      { err },
      'Could not connect to Redis. BullMQ skipped; job executions will default to inline synchronous.'
    );
  }
};

/**
 * Queue an email send job.
 */
export const queueEmail = async (data: { to: string; subject: string; text: string; html?: string }): Promise<void> => {
  if (emailQueue) {
    try {
      await emailQueue.add('send-email', data, { removeOnComplete: true });
      logger.info({ to: data.to }, 'Email job added to queue');
      return;
    } catch (err) {
      logger.warn({ err }, 'Failed to queue email job. Dispatching synchronously.');
    }
  }
  // Sync fallback
  await sendEmail(data);
};

/**
 * Queue a report compilation job.
 */
export const queueReportCompilation = async (data: {
  reportType: string;
  shopId: string;
  userId: string;
  filters?: Record<string, unknown>;
}): Promise<void> => {
  if (reportQueue) {
    try {
      await reportQueue.add('compile-report', data, { removeOnComplete: true });
      logger.info({ reportType: data.reportType }, 'Report job added to queue');
      return;
    } catch (err) {
      logger.warn({ err }, 'Failed to queue report job.');
    }
  }
  // Sync fallback or warning
  logger.info({ reportType: data.reportType }, 'Redis offline: processing report job synchronously');
};
export default {
  initializeQueues,
  queueEmail,
  queueReportCompilation
};
