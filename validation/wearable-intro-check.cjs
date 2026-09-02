const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:5174/';

async function scrollToStage(page, stageIndex) {
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

async function run() {
  const outputDirectory = path.join(__dirname, 'wearable-data');
  fs.mkdirSync(outputDirectory, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900, imageSize: [1600, 1000] },
    { name: 'tablet', width: 1024, height: 768, imageSize: [1600, 1000] },
    { name: 'mobile', width: 390, height: 844, imageSize: [900, 1100] },
  ]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    const introRequests = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && !message.text().includes('Failed to load resource')) errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.url().includes('intro-wearer')) introRequests.push(response.url());
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await scrollToStage(page, 0);
    await page.waitForFunction(() => {
      const image = document.querySelector('.wearableFrame0 .wearableIntroPortrait img');
      return image?.complete && image.naturalWidth > 0;
    });

    const state = await page.evaluate(() => {
      const frame = document.querySelector('.wearableFrame0');
      const image = frame.querySelector('.wearableIntroPortrait img');
      const lockup = frame.querySelector('.wearableIntroLockup');
      const frameRect = frame.getBoundingClientRect();
      const lockupRect = lockup.getBoundingClientRect();
      const portraitStyle = getComputedStyle(frame.querySelector('.wearableIntroPortrait'));
      return {
        active: frame.classList.contains('is-active'),
        stageCode: document.querySelector('.wearableStageCode')?.textContent,
        railText: [...document.querySelectorAll('.wearableRail small')][0]?.textContent,
        imageSize: [image.naturalWidth, image.naturalHeight],
        imageSource: image.currentSrc,
        alt: image.alt,
        title: lockup.querySelector('strong')?.textContent,
        subtitle: lockup.querySelector('span')?.textContent,
        frameRect: [frameRect.x, frameRect.y, frameRect.width, frameRect.height],
        lockupRect: [lockupRect.x, lockupRect.y, lockupRect.width, lockupRect.height],
        portraitOpacity: portraitStyle.opacity,
        portraitClip: portraitStyle.clipPath,
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    if (!state.active
      || state.stageCode !== '00 / DESIGN BRIEF'
      || state.railText !== '项目引子'
      || state.imageSize[0] !== viewport.imageSize[0]
      || state.imageSize[1] !== viewport.imageSize[1]
      || !state.imageSource.includes(viewport.name === 'mobile' ? 'intro-wearer-mobile.webp' : 'intro-wearer-desktop.webp')
      || state.alt !== '女生佩戴慧心耳康仪进行放松体验'
      || state.title !== '慧心耳康仪'
      || state.subtitle !== '情绪感知与温热舒缓概念穿戴设备'
      || state.portraitOpacity !== '1'
      || state.portraitClip === 'none'
      || state.horizontalOverflow > 1
      || errors.length) {
      throw new Error(`Invalid ${viewport.name} intro state: ${JSON.stringify({ state, introRequests, errors })}`);
    }

    await scrollToStage(page, 1);
    await scrollToStage(page, 0);
    await page.waitForFunction(() => (
      getComputedStyle(document.querySelector('.wearableFrame0 .wearableIntroPortrait')).opacity === '1'
    ), { timeout: 3500 });
    const reverseState = await page.evaluate(() => ({
      active: document.querySelector('.wearableFrame0').classList.contains('is-active'),
      opacity: getComputedStyle(document.querySelector('.wearableFrame0 .wearableIntroPortrait')).opacity,
    }));
    if (!reverseState.active || reverseState.opacity !== '1') {
      throw new Error(`Invalid ${viewport.name} reverse state: ${JSON.stringify(reverseState)}`);
    }

    await page.screenshot({ path: path.join(outputDirectory, `${viewport.name}-intro-wearer.png`) });
    console.log(JSON.stringify({ viewport: viewport.name, imageSize: state.imageSize, imageSource: path.basename(new URL(state.imageSource).pathname) }));
    await page.close();
  }

  const reducedPage = await browser.newPage({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce' });
  await reducedPage.goto(BASE_URL, { waitUntil: 'networkidle' });
  const reduced = await reducedPage.evaluate(() => {
    const portrait = document.querySelector('.wearableFrame0 .wearableIntroPortrait');
    const style = getComputedStyle(portrait);
    return { opacity: style.opacity, clipPath: style.clipPath, transition: style.transitionDuration };
  });
  if (reduced.opacity !== '1' || reduced.clipPath !== 'none' || reduced.transition !== '0s') {
    throw new Error(`Invalid reduced-motion intro state: ${JSON.stringify(reduced)}`);
  }
  await reducedPage.close();
  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
