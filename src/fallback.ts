import { cfg } from './config.js';
import type { Window } from './types.js';

export function parseWindows(primary: Window, fallbackStr: string): Window[] {
const extras = fallbackStr
.split('|')
.map(s => s.trim())
.filter(Boolean)
.map(s => {
const [start, end] = s.split('–').map(x => x.trim());
return { start, end } as Window;
});
return [primary, ...extras];
}

export function parseCourts(primary: string, fallbackStr: string): string[] {
const extras = fallbackStr
.split('|')
.map(s => s.trim())
.filter(Boolean);
return [primary, ...extras];
}

export function* candidatePairs() {
const primary = { start: cfg.TARGET_START, end: cfg.TARGET_END };
const windows = parseWindows(primary, cfg.FALLBACK_WINDOWS);
const courts = parseCourts(cfg.TARGET_COURT, cfg.FALLBACK_COURTS);
for (const w of windows) {
for (const c of courts) {
yield { court: c, window: w } as const;
}
}
}