import axios from 'axios';
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const LEX_BASE_URL = 'https://logistics.lazada.vn';

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
  const secret = process.env.INTERNAL_API_SECRET;
  // Use railway public URL if available, else localhost
  const apiUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/internal/push-lex-cookie` 
    : process.env.APP_URL 
      ? `${process.env.APP_URL}/api/internal/push-lex-cookie` 
      : 'http://localhost:3000/api/internal/push-lex-cookie';

  if (!secret) {
    console.error('Missing INTERNAL_API_SECRET. Cancelling harvest.');
    process.exit(1);
  }

  console.log(`Starting headless Chrome to harvest cookies for ${apiUrl}...`);

  chromium.use(StealthPlugin());
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
    
    // Navigating directly to a tracking URL ensures the WAF cookies for API access are set
    await page.goto(`${LEX_BASE_URL}/tracking?references=LEX_DUMMY`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Give WAF scripts a moment to run and set session cookies
    await page.waitForTimeout(3000);

    const cookies = await context.cookies();

    if (!cookies.length) {
      console.error('No cookies extracted.');
      return;
    }

    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    
    console.log(`Extracted ${cookies.length} cookies. Pushing...`);

    const response = await axios.post(
      apiUrl,
      { cookieHeader },
      { headers: { 'x-internal-secret': secret } },
    );

    console.log('Webhook push success:', response.data);

  } catch (error: any) {
    if (error.response) {
      console.error('Webhook push failed:', error.response.status, error.response.data);
    } else {
      console.error('Harvester execution error:', error.message);
    }
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
    // Force aggressive exit to clear all OS memory bound to this script
    process.exit(0);
  }
}

harvestCookies();
