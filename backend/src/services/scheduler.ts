import cron, { ScheduledTask } from 'node-cron';
import { randomUUID } from 'crypto';
import { SchedulerLockModel } from '../models/GuestReminder.js';
import { reminderService } from './reminderService.js';

/**
 * In-process job runner.
 *
 * Every instance schedules the same tick, so each pass first claims a
 * short-lived DB lock; only the winner does the work. That keeps behaviour
 * correct if the service is ever scaled past a single replica.
 */

const INSTANCE_ID = `${process.pid}-${randomUUID().slice(0, 8)}`;
const REMINDER_LOCK = 'guest_reminders';
/** Longer than a pass should ever take, short enough to recover from a crash. */
const LOCK_TTL_SECONDS = 10 * 60;

const tasks: ScheduledTask[] = [];

async function runGuestReminderTick(): Promise<void> {
  const acquired = await SchedulerLockModel.acquire(REMINDER_LOCK, LOCK_TTL_SECONDS, INSTANCE_ID);
  if (!acquired) return; // Another instance owns this tick.

  try {
    const { processed, sent } = await reminderService.runDueReminders();
    if (processed > 0) {
      console.log(`[scheduler] Guest reminders: ${processed} schedule(s) processed, ${sent} message(s) sent`);
    }
  } catch (error) {
    console.error('[scheduler] Guest reminder tick failed:', error);
  } finally {
    await SchedulerLockModel.release(REMINDER_LOCK, INSTANCE_ID).catch(() => {
      // The TTL will expire the lock anyway; never let cleanup mask the run.
    });
  }
}

export const scheduler = {
  start(): void {
    if (process.env.DISABLE_SCHEDULER === 'true') {
      console.log('[scheduler] Disabled via DISABLE_SCHEDULER');
      return;
    }

    // Hourly, on the hour. Cadences are measured in days, so hourly resolution
    // is ample and keeps the load trivial.
    tasks.push(cron.schedule('0 * * * *', runGuestReminderTick));

    console.log(`[scheduler] Started (instance ${INSTANCE_ID})`);
  },

  stop(): void {
    tasks.forEach((task) => task.stop());
    tasks.length = 0;
  },

  /** Exposed for manual triggering and tests. */
  runGuestReminderTick,
};
