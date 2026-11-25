import { chromium } from 'playwright';

async function testViews() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--enable-gpu-rasterization']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5174/');
  await page.getByRole('button', { name: 'STUDIO' }).click();
  await page.waitForSelector('button[aria-label="Cycle 3D camera angles"]', { timeout: 30000 });
  await page.waitForTimeout(1000);

  const viewBtn = page.getByRole('button', { name: 'Cycle 3D camera angles' });

  // 1. Click View Angle -> Front Headline
  await viewBtn.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'recordings/3d-view-02-front.png' });

  // 2. Click View Angle -> Side Profile
  await viewBtn.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'recordings/3d-view-03-side.png' });

  // 3. Click View Angle -> Rear Expedition
  await viewBtn.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'recordings/3d-view-04-rear.png' });

  // 4. Click View Angle -> Overhead Aerial
  await viewBtn.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'recordings/3d-view-05-aerial.png' });

  console.log('All camera view angles captured!');
  await browser.close();
}

testViews().catch(console.error);
