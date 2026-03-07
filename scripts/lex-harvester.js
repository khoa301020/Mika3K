/**
 * Lex Cookie Harvester — GitHub Actions Runner
 *
 * Launches a stealth Chromium browser to visit the Lazada Logistics page,
 * extracts WAF cookies, and pushes them to the bot's System Webhook.
 *
 * Environment variables (set as GitHub Secrets):
 *   - API_BASE_URL:          e.g. https://your-railway-url.up.railway.app
 *   - SYSTEM_SECRET_TOKEN:   Matches the bot's SYSTEM_SECRET_TOKEN env var
 */

const axios = require('axios');
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');

const LEX_BASE_URL = 'https://logistics.lazada.vn';
const LEX_COOKIE_CACHE_KEY = 'LEX_COOKIE';

const BROWSER_ARGS = [
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--no-first-run',
  '--disable-background-networking',
  '--disable-default-apps',
  '--disable-extensions',
  '--disable-sync',
  '--disable-translate',
  '--metrics-recording-only',
];

async function harvestCookies() {
  const token = process.env.SYSTEM_SECRET_TOKEN;
  let baseUrl = process.env.API_BASE_URL;

  if (!token || !baseUrl) {
    console.error('Missing SYSTEM_SECRET_TOKEN or API_BASE_URL. Aborting.');
    process.exit(1);
  }

  // Remove trailing slash if present to avoid double slashes
  baseUrl = baseUrl.replace(/\/+$/, '');
  const webhookUrl = `${baseUrl}/api/system/webhook/cache`;
  
  console.log(`[Harvester] Webhook target: ${webhookUrl}`);
  console.log(`[Harvester] Starting headless Chrome → ${LEX_BASE_URL}`);

  chromium.use(stealth());

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: BROWSER_ARGS,
    });

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
      locale: 'vi-VN',
      timezoneId: 'Asia/Ho_Chi_Minh',
    });

    const page = await context.newPage();
    await page.goto(`${LEX_BASE_URL}/tracking?references=LEX_DUMMY`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });

    // Wait for WAF JS challenge to resolve and set cookies
    await page.waitForTimeout(5_000);

    const cookies = await context.cookies();
    if (!cookies.length) {
      console.error('[Harvester] No cookies extracted.');
      process.exit(1);
    }

    const cookieHeader = cookies
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');
    console.log(`[Harvester] Extracted ${cookies.length} cookies. Pushing to webhook...`);

    // Push to the generic System webhook
    const response = await axios.post(
      webhookUrl,
      {
        cacheKey: LEX_COOKIE_CACHE_KEY,
        cacheValue: cookieHeader,
        ttl: 0, // No expiration — refreshed by cron every hour
      },
      {
        headers: { 'x-system-token': token },
        timeout: 15_000,
      },
    );

    console.log('[Harvester] Webhook push success:', response.data);
  } catch (error) {
    if (error.response) {
      console.error(
        '[Harvester] Webhook push failed:',
        error.response.status,
        error.response.data,
      );
    } else {
      console.error('[Harvester] Execution error:', error.message);
    }
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
    process.exit(0);
  }
}

harvestCookies();
