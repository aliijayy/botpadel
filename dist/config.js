import 'dotenv/config';
import { z } from 'zod';
const envSchema = z.object({
    PADELCONNECT_EMAIL: z.string().email(),
    PADELCONNECT_PASSWORD: z.string().min(6),
    TARGET_VENUE: z.string().min(2),
    TARGET_COURT: z.string().min(1),
    TARGET_START: z.string().regex(/^\d{2}:\d{2}$/),
    TARGET_END: z.string().regex(/^\d{2}:\d{2}$/),
    TIMEZONE: z.string().default('Europe/Zurich'),
    LEAD_DAYS: z.coerce.number().int().positive().default(14),
    FALLBACK_ENABLE: z.coerce.boolean().default(true),
    FALLBACK_WINDOWS: z.string().default(''),
    FALLBACK_COURTS: z.string().default(''),
    NOTIFY_CHANNEL: z.enum(['email', 'telegram']).default('email'),
    NOTIFY_TO: z.string().default(''),
    SMTP_HOST: z.string().default(''),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().default(''),
    SMTP_PASS: z.string().default(''),
    DRY_RUN: z.coerce.boolean().default(false),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    LOCK_DIR: z.string().default('.locks')
});
export const cfg = envSchema.parse(process.env);
