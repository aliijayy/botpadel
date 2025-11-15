import nodemailer from 'nodemailer';
import pino from 'pino';
import { cfg } from './config.js';

const log = pino({ level: cfg.LOG_LEVEL, transport: { target: 'pino-pretty' } });

export type Outcome =
| { ok: true; message: string; ref?: string; screenshotPath?: string }
| { ok: false; message: string; screenshotPath?: string };

export async function notify(outcome: Outcome) {
if (cfg.NOTIFY_CHANNEL === 'email') return notifyEmail(outcome);
log.warn('Only email notification implemented currently.');
}

async function notifyEmail(outcome: Outcome) {
const transporter = nodemailer.createTransport({
host: cfg.SMTP_HOST,
port: cfg.SMTP_PORT,
secure: cfg.SMTP_PORT === 465,
auth: cfg.SMTP_USER ? { user: cfg.SMTP_USER, pass: cfg.SMTP_PASS } : undefined
});

const subject = outcome.ok ? 'Padel booking ✅' : 'Padel booking ❌';
const lines = [
outcome.message,
outcome.screenshotPath ? `Screenshot: ${outcome.screenshotPath}` : ''
].filter(Boolean);

await transporter.sendMail({
from: cfg.SMTP_USER || cfg.NOTIFY_TO,
to: cfg.NOTIFY_TO,
subject,
text: lines.join('\n')
});
}