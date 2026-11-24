import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const recordingsDir = path.resolve(__dirname, '../recordings');

fs.mkdirSync(recordingsDir, { recursive: true });

async function runRecording() {
  console.log('--- Launching Microsoft Edge via Playwright ---');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: recordingsDir,
      size: { width: 1440, height: 900 }
    }
  });

  const page = await context.newPage();
  console.log('Navigating to Showroom at http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });

  // 1. Scroll to the flagship Showroom Spotlight Stage
  console.log('1. Scrolling into Showroom Spotlight Stage...');
  await page.locator('#showroom-spotlight').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  // Capture Milestone 1: AERO Exterior Stance
  console.log('2. AERO Stance: Theatrical beam, reflections, V8 engine telemetry...');
  await page.screenshot({ path: path.join(recordingsDir, '01-aero-stance.png') });
  await page.waitForTimeout(1500);

  // Optional: Ignite Defender V8 engine to show RPM HUD
  const igniteBtn = page.getByRole('button', { name: /IGNITE DEFENDER V8/i });
  if (await igniteBtn.isVisible()) {
    await igniteBtn.click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(recordingsDir, '02-aero-engine-active.png') });
  }

  // 3. Switch to COCKPIT perspective
  console.log('3. Triggering COCKPIT perspective switch...');
  const cockpitBtn = page.getByRole('button', { name: 'COCKPIT' });
  await cockpitBtn.click();

  // Watch the scripted sequence: Door opening -> Camera push-in -> Cluster boot -> Screen boot -> Ambient pulse
  console.log('   - Door opening & camera pushing into interior POV...');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(recordingsDir, '03-cockpit-door-open.png') });

  console.log('   - Cluster backlight fading up & Pivi Pro booting...');
  await page.waitForTimeout(1100);
  await page.screenshot({ path: path.join(recordingsDir, '04-cockpit-cluster-boot.png') });

  console.log('   - Ambient light strip active & idling pulse...');
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(recordingsDir, '05-cockpit-powered-up.png') });

  // 4. Switch to STUDIO 3D perspective
  console.log('4. Switching to STUDIO 3D Configurator perspective...');
  const studioBtn = page.getByRole('button', { name: 'STUDIO' });
  await studioBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(recordingsDir, '06-studio-3d-giallo.png') });

  // 5. Change colors live to verify ~400ms paint shader lerp
  console.log('5. Selecting PANGEA GREEN swatch...');
  const pangeaBtn = page.getByRole('button', { name: /Select PANGEA GREEN/i });
  await pangeaBtn.click();
  await page.waitForTimeout(600); // During and after 400ms lerp
  await page.screenshot({ path: path.join(recordingsDir, '07-studio-pangea-green.png') });
  await page.waitForTimeout(600);

  console.log('   Selecting TASMAN BLUE swatch...');
  const tasmanBtn = page.getByRole('button', { name: /Select TASMAN BLUE/i });
  await tasmanBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(recordingsDir, '08-studio-tasman-blue.png') });
  await page.waitForTimeout(600);

  console.log('   Selecting CARPATHIAN GREY swatch...');
  const carpathianBtn = page.getByRole('button', { name: /Select CARPATHIAN GREY/i });
  await carpathianBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(recordingsDir, '09-studio-carpathian-grey.png') });
  await page.waitForTimeout(600);

  console.log('   Selecting FUJI WHITE swatch...');
  const fujiBtn = page.getByRole('button', { name: /Select FUJI WHITE/i });
  await fujiBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(recordingsDir, '10-studio-fuji-white.png') });
  await page.waitForTimeout(600);

  console.log('   Selecting custom hex color (#C41E3A / Velvet Red)...');
  const colorInput = page.getByLabel('Choose custom paint color');
  await colorInput.fill('#c41e3a');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(recordingsDir, '11-studio-custom-red.png') });
  await page.waitForTimeout(1000);

  console.log('Closing page and finalizing continuous video capture...');
  await page.close();
  await context.close();
  await browser.close();

  const files = fs.readdirSync(recordingsDir);
  const videoFile = files.find((f) => f.endsWith('.webm'));
  console.log('--- Screen Capture Complete! ---');
  if (videoFile) {
    const videoPath = path.join(recordingsDir, videoFile);
    const finalVideoPath = path.join(recordingsDir, 'defender-showroom-cinematic-upgrade.webm');
    fs.renameSync(videoPath, finalVideoPath);
    console.log(`Video recorded: ${finalVideoPath} (${(fs.statSync(finalVideoPath).size / 1024).toFixed(1)} KB)`);
  }
  console.log(`Generated ${files.filter((f) => f.endsWith('.png')).length} milestone screenshots in recordings/`);
}

runRecording()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Recording error:', err);
    process.exit(1);
  });
