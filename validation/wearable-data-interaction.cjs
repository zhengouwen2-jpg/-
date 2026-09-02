const { chromium } = require('playwright');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function scrollToResearch(page, progress) {
  await page.evaluate((nextProgress) => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    const story = document.querySelector('.wearableStory');
    const top = window.scrollY + story.getBoundingClientRect().top;
    const distance = Math.max(1, story.offsetHeight - window.innerHeight);
    window.scrollTo(0, top + distance * ((0.5 + nextProgress) / 4));
  }, progress);
  await page.waitForTimeout(1100);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const failedResponses = [];
  desktop.on('response', (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });
  await desktop.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
  await scrollToResearch(desktop, 0.5);

  const pageText = await desktop.locator('body').innerText();
  assert(pageText.includes('3.59'), 'Missing WHO population value');
  assert(pageText.includes('48%'), 'Missing China workplace stress value');
  assert(!pageText.includes('88.9%'), 'Outdated PPT percentage is present');
  assert(!pageText.includes('32.4%'), 'Unverified PPT percentage is present');

  const visibleCharts = await desktop.locator('.researchPanel').evaluateAll((elements) => elements.map((element) => Number.parseFloat(getComputedStyle(element).opacity)));
  assert(visibleCharts.every((opacity) => opacity > 0.9), 'All research charts should be visible immediately');

  const desktopSource = desktop.locator('.researchGlobal .researchSource');
  await desktopSource.locator('summary').click();
  const sourceVisible = await desktopSource.locator('.researchSourceDetail').evaluate((element) => {
    const style = getComputedStyle(element);
    return style.visibility === 'visible' && Number.parseFloat(style.opacity) > 0.9;
  });
  assert(sourceVisible, 'Desktop source detail did not open');
  assert((await desktopSource.locator('a').getAttribute('href')).startsWith('https://www.who.int/'), 'WHO source link is incorrect');

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mobile.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
  await scrollToResearch(mobile, 0.5);
  const mobileSource = mobile.locator('.researchWorkforce .researchSource');
  await mobileSource.locator('summary').tap();
  await mobile.waitForTimeout(250);
  const sourceRect = await mobileSource.locator('.researchSourceDetail').boundingBox();
  assert(sourceRect && sourceRect.x >= 0 && sourceRect.y >= 0 && sourceRect.x + sourceRect.width <= 390, 'Mobile source detail exceeds viewport');

  const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await reduced.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
  await reduced.waitForFunction(() => document.querySelectorAll('.researchPanel').length === 3);
  const reducedPanels = await reduced.locator('.researchPanel').evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    return { opacity: style.opacity, visibility: style.visibility, position: style.position };
  }));
  assert(reducedPanels.every((panel) => panel.opacity === '1' && panel.visibility === 'visible' && panel.position === 'relative'), 'Reduced-motion charts are not all statically visible');

  console.log(JSON.stringify({
    desktopSourceVisible: sourceVisible,
    mobileSourceRect: sourceRect,
    reducedPanels,
    failedResponses,
  }, null, 2));

  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
