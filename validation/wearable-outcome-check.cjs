const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function openStage(page, stageIndex) {
  await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
  await page.evaluate((targetStage) => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    const story = document.querySelector('.wearableStory');
    const top = window.scrollY + story.getBoundingClientRect().top;
    const distance = Math.max(1, story.offsetHeight - window.innerHeight);
    window.scrollTo(0, top + distance * (targetStage / 4));
  }, stageIndex);
  await page.waitForTimeout(1100);
}

async function openAppStage(page) {
  await openStage(page, 3);
  await page.waitForFunction(() => [...document.querySelectorAll('.appPanel img')].every((image) => image.complete && image.naturalWidth > 0));
}

async function run() {
  const outputDirectory = path.join(__dirname, 'wearable-data');
  fs.mkdirSync(outputDirectory, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 1024, height: 768 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    const productRequests = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && !message.text().includes('Failed to load resource')) errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400 && response.url().startsWith('http://127.0.0.1:5174/')) errors.push(`${response.status()} ${response.url()}`);
      if (response.url().includes('app-product.webp')) productRequests.push(response.url());
    });
    await openAppStage(page);

    const initial = await page.evaluate(() => {
      const frame = document.querySelector('.wearableFrame3');
      const composition = frame.querySelector('.appEcosystemComposition');
      const panels = [...frame.querySelectorAll('.appPanel')];
      return {
        active: frame.classList.contains('is-active'),
        stageCode: document.querySelector('.wearableStageCode')?.textContent,
        railText: [...document.querySelectorAll('.wearableRail small')].at(-2)?.textContent,
        activePanel: composition.dataset.activePanel,
        panelCount: panels.length,
        panelImages: panels.map((panel) => {
          const image = panel.querySelector('img');
          const rect = panel.getBoundingClientRect();
          const imageRect = image.getBoundingClientRect();
          const imageStyle = getComputedStyle(image);
          const shellStyle = getComputedStyle(panel.querySelector('.appPhoneShell'));
          return {
            panel: panel.dataset.panel,
            size: [image.naturalWidth, image.naturalHeight],
            rect: [rect.x, rect.y, rect.width, rect.height],
            imageRect: [imageRect.x, imageRect.y, imageRect.width, imageRect.height],
            imageBorder: parseFloat(imageStyle.borderTopWidth),
            shellBackground: shellStyle.backgroundColor,
            shellPadding: parseFloat(shellStyle.paddingTop),
          };
        }),
        labels: panels.map((panel) => panel.querySelector('.appPanelCaption')?.textContent.replace(/\s+/g, ' ').trim()),
        hasProduct: Boolean(frame.querySelector('.appEcosystemProduct, [src*="app-product"]')),
        hasLinks: Boolean(frame.querySelector('.appEcosystemLinks')),
        hasSixView: Boolean(frame.querySelector('.outcomeTechnical, [href*="six-view"]')),
        scrollY: window.scrollY,
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    const expectedSizes = {
      'headwear-link': [1000, 1870],
      'rear-link': [1000, 1747],
      temperature: [1000, 1773],
      massage: [1000, 1798],
      'health-report': [1180, 2029],
      'emotion-calendar': [528, 1158],
    };
    const invalidImages = initial.panelImages.filter((item) => (
      !expectedSizes[item.panel]
      || item.size[0] !== expectedSizes[item.panel][0]
      || item.size[1] !== expectedSizes[item.panel][1]
      || item.rect[2] <= 0
      || item.rect[3] <= 0
      || item.imageRect[2] <= 0
      || item.imageRect[3] <= 0
      || Math.abs((item.imageRect[2] / item.imageRect[3]) - (item.size[0] / item.size[1])) > 0.025
      || item.imageBorder < 1
      || item.imageBorder > 2
      || item.shellBackground !== 'rgba(0, 0, 0, 0)'
      || item.shellPadding !== 0
    ));
    if (!initial.active || initial.stageCode !== '03 / APP ECOSYSTEM' || initial.railText !== 'APP生态' || initial.activePanel !== 'health-report' || initial.panelCount !== 6 || initial.hasProduct || initial.hasLinks || initial.hasSixView || invalidImages.length || productRequests.length || initial.horizontalOverflow > 1 || errors.length) {
      throw new Error(`Invalid ${viewport.name} initial state: ${JSON.stringify({ initial, invalidImages, productRequests, errors })}`);
    }

    const target = viewport.name === 'mobile' ? 'headwear-link' : 'massage';
    const selector = `.appPanel[data-panel="${target}"]`;
    if (viewport.name === 'mobile') await page.click(selector);
    else await page.hover(selector);
    await page.waitForTimeout(320);

    const interaction = await page.evaluate((panelId) => ({
      activePanel: document.querySelector('.appEcosystemComposition').dataset.activePanel,
      pressed: document.querySelector(`.appPanel[data-panel="${panelId}"]`).getAttribute('aria-pressed'),
      scrollY: window.scrollY,
      stageCode: document.querySelector('.wearableStageCode')?.textContent,
    }), target);
    if (interaction.activePanel !== target || interaction.pressed !== 'true' || Math.abs(interaction.scrollY - initial.scrollY) > 1 || interaction.stageCode !== '03 / APP ECOSYSTEM') {
      throw new Error(`Invalid ${viewport.name} interaction state: ${JSON.stringify({ initial, interaction })}`);
    }

    if (viewport.name === 'mobile') {
      await page.click('.appPanel[data-panel="health-report"]');
    } else {
      await page.mouse.move(2, 2);
    }
    await page.waitForTimeout(280);
    const restored = await page.locator('.appEcosystemComposition').getAttribute('data-active-panel');
    if (restored !== 'health-report') throw new Error(`Default report focus did not restore in ${viewport.name}`);

    await page.screenshot({ path: path.join(outputDirectory, `${viewport.name}-app-ecosystem.png`) });

    await openStage(page, 4);
    await page.waitForFunction(() => document.querySelector('.outcomeTechnicalSheet')?.complete);
    const outcome = await page.evaluate(() => {
      const frame = document.querySelector('.wearableFrame4');
      const image = frame.querySelector('.outcomeTechnicalSheet');
      return {
        active: frame.classList.contains('is-active'),
        stageCode: document.querySelector('.wearableStageCode')?.textContent,
        railText: [...document.querySelectorAll('.wearableRail small')].at(-1)?.textContent,
        naturalSize: [image.naturalWidth, image.naturalHeight],
        objectFit: getComputedStyle(image).objectFit,
      };
    });
    if (!outcome.active || outcome.stageCode !== '04 / OUTCOME' || outcome.railText !== '最终成果' || outcome.naturalSize[0] !== 3840 || outcome.naturalSize[1] !== 2160 || outcome.objectFit !== 'contain') {
      throw new Error(`Invalid ${viewport.name} restored outcome: ${JSON.stringify(outcome)}`);
    }
    console.log(JSON.stringify({ viewport: viewport.name, initial, interaction }));
    await page.close();
  }

  const reducedPage = await browser.newPage({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce' });
  await reducedPage.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
  await reducedPage.waitForFunction(() => document.querySelector('.wearableFrame3 .appPanel'));
  const reduced = await reducedPage.evaluate(() => {
    const frame = document.querySelector('.wearableFrame3');
    const panel = frame.querySelector('.appPanel');
    return {
      visible: getComputedStyle(frame).visibility,
      animation: getComputedStyle(panel).animationName,
      transition: getComputedStyle(panel).transitionDuration,
    };
  });
  if (reduced.visible !== 'visible' || reduced.animation !== 'none' || reduced.transition !== '0s') {
    throw new Error(`Invalid reduced-motion state: ${JSON.stringify(reduced)}`);
  }
  await reducedPage.close();

  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
