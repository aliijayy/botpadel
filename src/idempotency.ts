import fs from 'node:fs';
import path from 'node:path';
import { cfg } from './config.js';

export function idempotencyKey(dateISO: string, court: string, start: string, end: string) {
return `${dateISO}:${court}:${start}-${end}`.replace(/\s+/g, '_');
}

export function precommit(key: string): boolean {
const dir = cfg.LOCK_DIR;
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, key);
if (fs.existsSync(file)) return false; // already booked/attempted
fs.writeFileSync(file, String(Date.now()));
return true;
}