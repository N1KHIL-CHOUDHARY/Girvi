import { globalPrisma } from '../config/database';
import { logger } from '../common/logger';
import { env } from '../config/env';

export interface DailyDbReadResult {
  success: boolean;
  executedAt: Date;
  durationMs: number;
  details?: {
    currentTime?: string;
    databaseName?: string;
    shopCount?: number;
  };
  error?: string;
}

export interface DailyDbReaderState {
  enabled: boolean;
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR';
  lastRunAt: string | null;
  lastDurationMs: number | null;
  lastError: string | null;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  nextRunAt: string | null;
  details?: {
    currentTime?: string;
    databaseName?: string;
    shopCount?: number;
  };
}

const state: DailyDbReaderState = {
  enabled: env.DB_DAILY_PING_ENABLED ?? true,
  status: 'IDLE',
  lastRunAt: null,
  lastDurationMs: null,
  lastError: null,
  totalRuns: 0,
  successfulRuns: 0,
  failedRuns: 0,
  nextRunAt: null
};

let scheduledTimer: NodeJS.Timeout | null = null;
let isJobRunning = false;

/**
 * Execute an active read operation on the PostgreSQL / Supabase database.
 * This reads system information and queries the database to keep connection poolers
 * and cloud database instances active and healthy.
 */
export const performDailyDatabaseRead = async (): Promise<DailyDbReadResult> => {
  if (isJobRunning) {
    logger.warn('⚠️ [DailyDbReader] Read job is already running. Skipping overlapping execution.');
    return {
      success: false,
      executedAt: new Date(),
      durationMs: 0,
      error: 'Job already running'
    };
  }

  isJobRunning = true;
  state.status = 'RUNNING';
  const startTime = Date.now();
  const executedAt = new Date();

  try {
    // 1. Execute a raw diagnostic query
    const rawResult = await globalPrisma.$queryRaw<
      Array<{ keepalive: number; current_time: Date; db_name: string }>
    >`SELECT 1 AS keepalive, NOW() AS current_time, current_database() AS db_name;`;

    // 2. Perform a lightweight application table read (count shops)
    let shopCount: number | undefined;
    try {
      shopCount = await globalPrisma.shop.count();
    } catch {
      // Non-fatal if shop table is not yet migrated
    }

    const durationMs = Date.now() - startTime;
    const firstRow = rawResult?.[0];

    state.status = 'SUCCESS';
    state.lastRunAt = executedAt.toISOString();
    state.lastDurationMs = durationMs;
    state.lastError = null;
    state.totalRuns += 1;
    state.successfulRuns += 1;
    state.details = {
      currentTime: firstRow?.current_time ? new Date(firstRow.current_time).toISOString() : undefined,
      databaseName: firstRow?.db_name || undefined,
      shopCount
    };

    logger.info(
      {
        durationMs,
        dbTime: state.details.currentTime,
        dbName: state.details.databaseName,
        shopCount: state.details.shopCount,
        nextRunAt: state.nextRunAt
      },
      '✓ [DailyDbReader] Daily database read / keep-alive executed successfully'
    );

    return {
      success: true,
      executedAt,
      durationMs,
      details: state.details
    };
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : String(err);

    state.status = 'ERROR';
    state.lastRunAt = executedAt.toISOString();
    state.lastDurationMs = durationMs;
    state.lastError = errorMessage;
    state.totalRuns += 1;
    state.failedRuns += 1;

    logger.error(
      {
        err,
        durationMs,
        nextRunAt: state.nextRunAt
      },
      '❌ [DailyDbReader] Daily database read operation encountered an error'
    );

    return {
      success: false,
      executedAt,
      durationMs,
      error: errorMessage
    };
  } finally {
    isJobRunning = false;
  }
};

/**
 * Schedule the next daily database read.
 */
const scheduleNextRun = (intervalMs: number) => {
  if (scheduledTimer) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }

  const nextExecution = new Date(Date.now() + intervalMs);
  state.nextRunAt = nextExecution.toISOString();

  logger.info(
    { nextRunAt: state.nextRunAt, intervalHours: intervalMs / (1000 * 60 * 60) },
    '🕒 [DailyDbReader] Next daily database read scheduled'
  );

  scheduledTimer = setTimeout(async () => {
    try {
      await performDailyDatabaseRead();
    } catch (err) {
      logger.error({ err }, '❌ [DailyDbReader] Uncaught error during scheduled execution');
    } finally {
      // Schedule the next cycle recursively
      if (state.enabled) {
        scheduleNextRun(intervalMs);
      }
    }
  }, intervalMs);

  // Allow Node process to exit gracefully if this timer is active
  if (scheduledTimer.unref) {
    scheduledTimer.unref();
  }
};

export interface StartReaderOptions {
  runImmediately?: boolean;
  intervalHours?: number;
}

/**
 * Start the daily database reader background schedule.
 */
export const startDailyDatabaseReader = async (options: StartReaderOptions = {}): Promise<void> => {
  const { runImmediately = true, intervalHours = env.DB_DAILY_PING_INTERVAL_HOURS || 24 } = options;

  if (!env.DB_DAILY_PING_ENABLED) {
    state.enabled = false;
    logger.info('ℹ️ [DailyDbReader] Daily database reading is disabled in configuration (DB_DAILY_PING_ENABLED=false)');
    return;
  }

  state.enabled = true;
  const intervalMs = Math.max(1, intervalHours) * 60 * 60 * 1000;

  logger.info(
    { intervalHours, runImmediately },
    '🚀 [DailyDbReader] Initializing daily database reader keep-alive scheduler...'
  );

  // Set the next run timestamp
  const nextExecution = new Date(Date.now() + intervalMs);
  state.nextRunAt = nextExecution.toISOString();

  // Run immediately on launch if requested
  if (runImmediately) {
    // Settle briefly after bootstrap then run
    setTimeout(async () => {
      try {
        await performDailyDatabaseRead();
      } catch (err) {
        logger.error({ err }, '❌ [DailyDbReader] Initial database read failed');
      }
    }, 1000);
  }

  // Schedule the recurring timer
  scheduleNextRun(intervalMs);
};

/**
 * Stop the daily database reader schedule (for graceful shutdowns or testing).
 */
export const stopDailyDatabaseReader = (): void => {
  if (scheduledTimer) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }
  state.status = 'IDLE';
  state.nextRunAt = null;
  logger.info('🛑 [DailyDbReader] Daily database reader schedule stopped.');
};

/**
 * Retrieve the current diagnostic status of the daily database reader.
 */
export const getDailyDatabaseReadStatus = (): DailyDbReaderState => {
  return { ...state };
};

export default {
  performDailyDatabaseRead,
  startDailyDatabaseReader,
  stopDailyDatabaseReader,
  getDailyDatabaseReadStatus
};
