const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:5174/';

async function openPersonaStage(page) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    const story = document.querySelector('.wearableStory');
    const top = window.scrollY + story.getBoundingClientRect().top;
    const distance = Math.max(1, story.offsetHeight - window.innerHeight);
    window.scrollTo(0, top + distance * (2 / 4));
  });
  await page.waitForTimeout(900);
  await page.waitForFunction(() => {
    const image = document.querySelector('.wearableFrame2 .personaProfilePortrait img');
    return image?.complete && image.naturalWidth > 0;
  });
}

function isInside(inner, outer, tolerance = 1) {
  return inner.left >= outer.left - tolerance
    && inner.top >= outer.top - tolerance
    && inner.right <= outer.right + tolerance
    && inner.bottom <= outer.bottom + tolerance;
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
    page.on('console', (message) => {
      if (message.type() === 'error' && !message.text().includes('Failed to load resource')) errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await openPersonaStage(page);

    const state = await page.evaluate(() => {
      const frame = document.querySelector('.wearableFrame2');
      const composition = frame.querySelector('.personaProfileComposition');
      const sections = [...frame.querySelectorAll('.personaProfileSection')];
      const image = frame.querySelector('.personaProfilePortrait img');
      const frameRect = frame.getBoundingClientRect();
      const compositionRect = composition.getBoundingClientRect();
      const rect = (element) => {
        const box = element.getBoundingClientRect();
        return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
      };
      return {
        active: frame.classList.contains('is-active'),
        stageCode: document.querySelector('.wearableStageCode')?.textContent,
        railText: [...document.querySelectorAll('.wearableRail small')][2]?.textContent,
        title: document.querySelector('.wearableNarrative h3')?.textContent,
        text: composition.textContent.replace(/\s+/g, ' ').trim(),
        sectionCount: sections.length,
        signalCount: frame.querySelectorAll('.personaSignal').length,
        hasOldComposition: Boolean(frame.querySelector('.personaSecondary, .personaMain')),
        imageSize: [image.naturalWidth, image.naturalHeight],
        frameRect: rect(frame),
        compositionRect: rect(composition),
        sectionRects: sections.map(rect),
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        frameStyle: {
          opacity: getComputedStyle(frame).opacity,
          visibility: getComputedStyle(frame).visibility,
        },
      };
    });

    const requiredText = ['职场奋斗族', '25–45', '主力年龄 28–40 岁', '用户画像推定', '通勤路上', '办公午休', '睡前放松', '加班间隙', '一物多用'];
    const missingText = requiredText.filter((item) => !state.text.includes(item));
    const allInside = state.sectionRects.every((section) => isInside(section, state.frameRect));
    const compositionInside = isInside(state.compositionRect, state.frameRect);

    if (!state.active
      || state.stageCode !== '02 / PERSONA'
      || state.railText !== '核心人群'
      || state.sectionCount !== 4
      || state.signalCount !== 3
      || state.hasOldComposition
      || state.imageSize[0] !== 1800
      || state.imageSize[1] !== 1200
      || state.horizontalOverflow > 1
      || !allInside
      || !compositionInside
      || missingText.length
      || errors.length) {
      throw new Error(`Invalid ${viewport.name} persona state: ${JSON.stringify({ state, missingText, errors })}`);
    }

    await page.screenshot({ path: path.join(outputDirectory, `${viewport.name}-persona.png`) });
    console.log(JSON.stringify({ viewport: viewport.name, title: state.title, imageSize: state.imageSize, sectionsInside: allInside }));
    await page.close();
  }

  const reducedPage = await browser.newPage({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce' });
  await openPersonaStage(reducedPage);
  const reduced = await reducedPage.evaluate(() => {
    const frame = document.querySelector('.wearableFrame2');
    return {
      visible: getComputedStyle(frame).visibility,
      opacity: getComputedStyle(frame).opacity,
      sections: frame.querySelectorAll('.personaProfileSection').length,
    };
  });
  if (reduced.visible !== 'visible' || reduced.opacity !== '1' || reduced.sections !== 4) {
    throw new Error(`Invalid reduced-motion persona state: ${JSON.stringify(reduced)}`);
  }
  await reducedPage.close();
  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
