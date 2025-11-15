import { DateTime, Duration } from 'luxon';
import pino from 'pino';
import { cfg } from './config.js';
import { performance } from 'node:perf_hooks';

const log = pino({ level: cfg.LOG_LEVEL, transport: { target: 'pino-pretty' } });

export function targetDate(now = DateTime.now().setZone(cfg.TIMEZONE)) {
  // Booking opens at 00:00 for the same weekday two weeks ahead
  const target = now.plus({ days: cfg.LEAD_DAYS }).startOf('day');
  return target; // Luxon DateTime
}

export async function waitUntilLocalMidnight(now = DateTime.now().setZone(cfg.TIMEZONE)) {
  const next = now.plus({ days: 1 }).startOf('day');
  const ms = next.diff(now).as('milliseconds');
  log.info({ next: next.toISO() }, 'Waiting until local midnight...');
  await preciseSleep(ms);
}

async function preciseSleep(ms: number) {
  const end = performance.now() + ms;
  while (performance.now() < end - 15) {
    await new Promise(r => setTimeout(r, 10));
  }
  // busy-wait the last ~15ms to minimize drift
  while (performance.now() < end) {}
}

/** Always return a plain ISO date string (never null), e.g. "2025-11-29" */
export function formatISO(d: DateTime): string {
  return d.toFormat('yyyy-LL-dd');
}

