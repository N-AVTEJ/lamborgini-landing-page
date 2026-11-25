import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--enable-gpu-rasterization']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  await page.goto('http://localhost:5174/');
  await page.getByRole('button', { name: 'STUDIO' }).click();
  await page.waitForSelector('button[aria-label="Cycle 3D camera angles"]', { timeout: 30000 });
  await page.waitForTimeout(2000);

  const canvas = page.locator('canvas.studio-3d-canvas');
  await canvas.screenshot({ path: 'recordings/canvas-only.png' });
  console.log('Saved recordings/canvas-only.png');
  await browser.close();
}

test().catch(console.error);
