import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  performDailyDatabaseRead,
  startDailyDatabaseReader,
  stopDailyDatabaseReader,
  getDailyDatabaseReadStatus
} from '../../src/jobs/daily-db-reader.job';
import { globalPrisma } from '../../src/config/database';

vi.mock('../../src/config/database', () => ({
  globalPrisma: {
    $queryRaw: vi.fn(),
    shop: {
      count: vi.fn()
    }
  },
  prisma: {
    $queryRaw: vi.fn()
  }
}));

describe('Daily Database Reader Job', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stopDailyDatabaseReader();
  });

  afterEach(() => {
    stopDailyDatabaseReader();
  });

  it('should successfully perform a daily database read and update state', async () => {
    const mockDbTime = new Date('2026-08-17T12:00:00.000Z');
    vi.mocked(globalPrisma.$queryRaw).mockResolvedValueOnce([
      { keepalive: 1, current_time: mockDbTime, db_name: 'postgres' }
    ]);
    vi.mocked(globalPrisma.shop.count).mockResolvedValueOnce(5);

    const result = await performDailyDatabaseRead();

    expect(result.success).toBe(true);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.details?.currentTime).toBe(mockDbTime.toISOString());
    expect(result.details?.databaseName).toBe('postgres');
    expect(result.details?.shopCount).toBe(5);

    const status = getDailyDatabaseReadStatus();
    expect(status.status).toBe('SUCCESS');
    expect(status.totalRuns).toBeGreaterThanOrEqual(1);
    expect(status.successfulRuns).toBeGreaterThanOrEqual(1);
    expect(status.lastError).toBeNull();
  });

  it('should gracefully handle database query errors without throwing', async () => {
    vi.mocked(globalPrisma.$queryRaw).mockRejectedValueOnce(new Error('Connection timeout to Supabase pooler'));

    const result = await performDailyDatabaseRead();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Connection timeout to Supabase pooler');

    const status = getDailyDatabaseReadStatus();
    expect(status.status).toBe('ERROR');
    expect(status.lastError).toContain('Connection timeout');
    expect(status.failedRuns).toBeGreaterThanOrEqual(1);
  });

  it('should start and stop the scheduler cleanly', async () => {
    await startDailyDatabaseReader({ runImmediately: false, intervalHours: 12 });

    const status = getDailyDatabaseReadStatus();
    expect(status.enabled).toBe(true);
    expect(status.nextRunAt).toBeDefined();

    stopDailyDatabaseReader();
    const stoppedStatus = getDailyDatabaseReadStatus();
    expect(stoppedStatus.status).toBe('IDLE');
    expect(stoppedStatus.nextRunAt).toBeNull();
  });
});
