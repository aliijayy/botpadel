import { DateTime } from 'luxon';
import { cfg } from './config.js';
import { runOnce } from './book.js';
import { waitUntilLocalMidnight } from './schedule.js';

const cmd = process.argv[2] || 'book';

async function main() {
  if (cmd === 'schedule') {
    const now = DateTime.now().setZone(cfg.TIMEZONE);
    const secs = now.endOf('day').diff(now, 'seconds').seconds;
    if (secs > 5) await new Promise(r => setTimeout(r, (secs - 5) * 1000));
    await waitUntilLocalMidnight();
    await runOnce();
  } else if (cmd === 'book') {
    await runOnce();
  } else {
    console.log('Usage: pnpm book | pnpm schedule');
  }
}

main();
