const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = 'http://127.0.0.1:5174/';

async function openFotile(page) {
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.locator('.projectCardFotile').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('.projectCardFotile .agPanel img')].every((image) => image.complete));
}

async function activeIndex(page) {
  return page.locator('.fotileLineSidebar .lineSidebarItem').evaluateAll((items) => items.findIndex((item) => item.getAttribute('aria-current') === 'true'));
}

async function run() {
  const outputDirectory = path.join(__dirname, 'fotile-navigation');
  fs.mkdirSync(outputDirectory, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 1024, height: 768 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport });
    await openFotile(page);
    const items = page.locator('.fotileLineSidebar .lineSidebarItem');

    if (await activeIndex(page) !== 2) throw new Error(`${viewport.name}: default item is not 03`);

    if (viewport.name !== 'mobile') {
      await page.evaluate(async () => {
        const buttons = [...document.querySelectorAll('.fotileLineSidebar .lineSidebarItem button')];
        for (let index = 0; index < buttons.length; index += 1) {
          const previous = buttons[index - 1] || document.body;
          const next = buttons[index + 1] || document.body;
          buttons[index].dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse', relatedTarget: previous }));
          buttons[index].dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse' }));
          await new Promise((resolve) => window.setTimeout(resolve, 20));
          buttons[index].dispatchEvent(new PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse', relatedTarget: next }));
        }
      });
      await page.waitForTimeout(210);
      const afterSweep = await activeIndex(page);
      if (afterSweep !== 2) throw new Error(`${viewport.name}: fast sweep changed the active item to ${afterSweep + 1}`);

      await items.nth(0).hover();
      await page.waitForTimeout(220);
      if (await activeIndex(page) !== 0) throw new Error(`${viewport.name}: dwell did not activate item 01`);
    }

    await items.nth(4).locator('button').click();
    if (await activeIndex(page) !== 4) throw new Error(`${viewport.name}: click did not activate item 05`);

    await items.nth(1).locator('button').focus();
    if (await activeIndex(page) !== 1) throw new Error(`${viewport.name}: focus did not activate item 02`);
    if (viewport.name !== 'mobile') {
      let settled = false;
      for (let sample = 0; sample < 12; sample += 1) {
        await page.waitForTimeout(200);
        const grow = await page.locator('.projectCardFotile .agPanel').evaluateAll((panels) => panels.map((panel) => Number.parseFloat(getComputedStyle(panel).flexGrow)));
        settled = grow[1] > 5.9 && grow.every((value, index) => index === 1 || value < 1.1);
        if (settled) break;
      }
      if (!settled) throw new Error(`${viewport.name}: accordion did not settle at 6:1`);
    }

    const metrics = await page.evaluate(() => {
      const items = [...document.querySelectorAll('.fotileLineSidebar .lineSidebarItem')];
      const panels = [...document.querySelectorAll('.projectCardFotile .agPanel')];
      return {
        transforms: items.map((item) => getComputedStyle(item.querySelector('.lineSidebarLabel')).transform),
        markerWidths: items.map((item) => item.querySelector('.lineSidebarMarker').getBoundingClientRect().width),
        panelGrow: panels.map((panel) => Number.parseFloat(getComputedStyle(panel).flexGrow)),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    if (metrics.transforms.some((transform) => transform !== 'none')) throw new Error(`${viewport.name}: label translation remains`);
    if (viewport.name !== 'mobile' && Math.max(...metrics.markerWidths) > 47) throw new Error(`${viewport.name}: marker is still too long`);
    if (viewport.name !== 'mobile' && (metrics.panelGrow[1] < 5.9 || metrics.panelGrow.some((grow, index) => index !== 1 && grow > 1.1))) {
      throw new Error(`${viewport.name}: accordion ratio is not 6:1: ${JSON.stringify(metrics.panelGrow)}`);
    }
    if (metrics.overflow > 1) throw new Error(`${viewport.name}: horizontal overflow ${metrics.overflow}`);

    await page.screenshot({ path: path.join(outputDirectory, `${viewport.name}.png`) });
    console.log(JSON.stringify({ viewport: viewport.name, metrics }));
    await page.close();
  }

  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
