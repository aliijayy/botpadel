// src/book.ts
import { chromium } from 'playwright';
import pino from 'pino';
import { cfg } from './config.js';
import { candidatePairs } from './fallback.js';
import { idempotencyKey, precommit } from './idempotency.js';
import { SEL } from './selectors.js';
import { targetDate, formatISO } from './schedule.js';
import { notify } from './notify.js';
const log = pino({ level: cfg.LOG_LEVEL, transport: { target: 'pino-pretty' } });
export async function runOnce() {
    const when = targetDate();
    const dateISO = formatISO(when);
    log.info({ dateISO }, 'Target date');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await login(page);
        const outcome = await bookCore(page, dateISO);
        await browser.close();
        await notify(outcome);
    }
    catch (err) {
        const msg = `Unexpected failure: ${err?.message || err}`;
        log.error(err, msg);
        const screenshotPath = `playwright-failure-${Date.now()}.png`;
        try {
            await page.screenshot({ path: screenshotPath, fullPage: true });
        }
        catch { }
        await browser.close();
        await notify({ ok: false, message: msg, screenshotPath });
    }
}
async function login(page) {
    // Login then jump to grid
    await page.goto('https://padelconnect.matchpoint.com.es/Login.aspx', { waitUntil: 'domcontentloaded' });
    // Robust by label + fallbacks from selectors.ts
    const email = page.locator(SEL.login.email);
    const pass = page.locator(SEL.login.password);
    const btn = page.locator(SEL.login.submit);
    await email.fill(cfg.PADELCONNECT_EMAIL);
    await pass.fill(cfg.PADELCONNECT_PASSWORD);
    await btn.click();
    await page.waitForLoadState('networkidle');
    await page.goto('https://padelconnect.matchpoint.com.es/Booking/Grid.aspx', { waitUntil: 'domcontentloaded' });
}
async function gotoVenueAndDate(page, dateISO) {
    // Try native date input first
    const dateInput = page.locator(SEL.nav.dateInput).first();
    const visible = await dateInput.isVisible().catch(() => false);
    if (visible) {
        await dateInput.fill(dateISO);
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');
        return;
    }
    // Fallback: click next day until the target date text appears
    let guard = 30;
    while (guard-- > 0) {
        const hasDate = await page.locator(`text=${dateISO}`).first().isVisible().catch(() => false);
        if (hasDate)
            break;
        await page.click(SEL.nav.nextDay);
        await page.waitForTimeout(150);
    }
}
async function trySelect(page, court, start, end) {
    const courtCol = page.locator(SEL.grid.courtColumn(court));
    const startBtn = courtCol.locator(SEL.grid.slotButton(start));
    const ok = await startBtn.isVisible().catch(() => false);
    if (!ok)
        return false;
    await startBtn.click();
    // Some UIs ask to click end time to set duration
    const endBtn = courtCol.locator(SEL.grid.slotButton(end));
    if (await endBtn.isVisible().catch(() => false)) {
        await endBtn.click();
    }
    return true;
}
async function checkCaptcha(page) {
    const hasCaptcha = await page.locator(SEL.grid.captcha).first().isVisible().catch(() => false);
    if (hasCaptcha) {
        throw new Error('CAPTCHA detected. Stopping per policy.');
    }
}
async function confirm(page) {
    await checkCaptcha(page);
    if (cfg.DRY_RUN)
        return true; // simulate success
    await page.click(SEL.grid.confirm);
    await page.waitForLoadState('networkidle');
    return true;
}
async function bookCore(page, dateISO) {
    await gotoVenueAndDate(page, dateISO);
    for (const { court, window } of candidatePairs()) {
        const key = idempotencyKey(dateISO, court, window.start, window.end);
        if (!precommit(key)) {
            return { ok: true, message: `Already attempted/booked: ${key}` };
        }
        const selected = await trySelect(page, court, window.start, window.end);
        if (!selected)
            continue;
        const ok = await confirm(page);
        if (ok) {
            return { ok: true, message: `Booked ${court} ${window.start}-${window.end} on ${dateISO}` };
        }
    }
    return { ok: false, message: `No available slots matched for ${dateISO}` };
}
