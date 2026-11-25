import { chromium } from 'playwright';
import fs from 'fs';

async function capture() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--enable-gpu-rasterization']
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err) => console.error('PAGE ERROR:', err));

  console.log('Navigating to http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });

  // Scroll to Showroom Studio Configurator Stage (Centered in Viewport)
  console.log('Scrolling to studio configurator...');
  await page.evaluate(() => {
    const stage = document.querySelector('.shared-staging-canvas') || document.getElementById('showroom-spotlight');
    if (stage) stage.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(1000);

  // Click STUDIO perspective button
  console.log('Clicking STUDIO perspective button...');
  const studioBtn = page.getByRole('button', { name: 'STUDIO' });
  await studioBtn.click();
  console.log('Waiting for 3D model to load and mount (VIEW ANGLE button to appear)...');
  await page.waitForSelector('button:has-text("VIEW ANGLE")', { timeout: 30000 });
  console.log('3D Defender loaded and mounted successfully in browser!');
  await page.waitForTimeout(1000); // Allow camera/turntable frame to settle

  // Check if 3D canvas is present
  const canvas = await page.$('canvas.studio-3d-canvas');
  console.log('3D Canvas found:', Boolean(canvas));

  if (!fs.existsSync('recordings')) {
    fs.mkdirSync('recordings', { recursive: true });
  }

  // Target the Showroom Spotlight Stage for comprehensive high-res capture
  const stage = page.locator('#showroom-spotlight');

  // 1. Initial Giallo Vivo
  console.log('Capturing Giallo Vivo...');
  await stage.screenshot({ path: 'recordings/3d-studio-giallo-vivo.png' });

  // 2. Select PANGEA GREEN
  console.log('Selecting Pangea Green...');
  const pangeaBtn = page.getByRole('button', { name: /Select PANGEA GREEN/i });
  await pangeaBtn.click();
  await page.waitForTimeout(600);
  await stage.screenshot({ path: 'recordings/3d-studio-pangea-green.png' });

  // 3. Select TASMAN BLUE
  console.log('Selecting Tasman Blue...');
  const tasmanBtn = page.getByRole('button', { name: /Select TASMAN BLUE/i });
  await tasmanBtn.click();
  await page.waitForTimeout(600);
  await stage.screenshot({ path: 'recordings/3d-studio-tasman-blue.png' });

  // 4. Select CARPATHIAN GREY
  console.log('Selecting Carpathian Grey...');
  const carpathianBtn = page.getByRole('button', { name: /Select CARPATHIAN GREY/i });
  await carpathianBtn.click();
  await page.waitForTimeout(600);
  await stage.screenshot({ path: 'recordings/3d-studio-carpathian-grey.png' });

  // 5. Select FUJI WHITE
  console.log('Selecting Fuji White...');
  const fujiBtn = page.getByRole('button', { name: /Select FUJI WHITE/i });
  await fujiBtn.click();
  await page.waitForTimeout(600);
  await stage.screenshot({ path: 'recordings/3d-studio-fuji-white.png' });

  // 6. Test Bespoke Custom Hex
  console.log('Selecting Custom SVO Bespoke Hex (#ff3300)...');
  const colorInput = page.locator('input[type="color"]');
  await colorInput.fill('#ff3300');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'recordings/3d-studio-custom-red.png' });

  // 7. Reset to Giallo Vivo and Cycle Camera Angles
  console.log('Resetting to Giallo Vivo and Cycling Viewpoints...');
  const gialloBtn = page.getByRole('button', { name: /Select GIALLO VIVO/i });
  await gialloBtn.click();
  await page.waitForTimeout(500);

  const viewBtn = page.getByRole('button', { name: /Cycle 3D camera angles/i });

  // View 2: Front Headline
  await viewBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'recordings/3d-view-02-front.png' });

  // View 3: Side Profile
  await viewBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'recordings/3d-view-03-side.png' });

  // View 4: Rear Expedition
  await viewBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'recordings/3d-view-04-rear.png' });

  // View 5: Overhead Aerial
  await viewBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'recordings/3d-view-05-aerial.png' });

  // Reset Camera View
  const resetBtn = page.getByRole('button', { name: /Reset 3D camera to default angle/i });
  await resetBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'recordings/3d-view-01-hero-reset.png' });

  console.log('All screenshots and viewpoints captured successfully!');
  await browser.close();
}

capture().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
