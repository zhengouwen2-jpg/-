import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'file:///C:/Users/24742/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'validation');
const BASE_URL = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5174/';
fs.mkdirSync(OUT, { recursive: true });

async function waitForViewer(page) {
  await page.locator('#vacuum-project').scrollIntoViewIfNeeded();
  await page.waitForSelector('.vacuumViewerShell[data-ready="true"]', { timeout: 30000 });
  const frame = page.frames().find((item) => item.url().includes('/vacuum-viewer/'));
  if (!frame) throw new Error('Vacuum viewer iframe did not load');
  await frame.waitForFunction(() => window.__APP_READY__ === true);
  await page.waitForTimeout(500);
  return frame;
}

function recordErrors(page, errors) {
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
      errors.push(`console: ${message.text()}`);
    }
  });
  page.on('response', (response) => {
    const url = response.url();
    const isKnownExternalFont = url.includes('CompressaPRO-GX.woff2');
    if (response.status() >= 400 && !url.endsWith('/favicon.ico') && !isKnownExternalFont) {
      errors.push(`response ${response.status()}: ${response.url()}`);
    }
  });
}

async function readScenePresentation(frame) {
  return frame.evaluate(() => ({
    state: window.__VACUUM_APP__.getState(),
    panelOpacity: Number.parseFloat(getComputedStyle(document.querySelector('.scenes-panel')).opacity),
    cards: Array.from(document.querySelectorAll('.scene-card')).map((card) => ({
      id: card.dataset.scene,
      active: card.classList.contains('active'),
      preview: card.classList.contains('preview'),
      size: innerWidth >= 1180 ? card.getBoundingClientRect().height : card.getBoundingClientRect().width,
      opacity: Number.parseFloat(getComputedStyle(card).opacity),
    })),
  }));
}

async function settleScenePresentation(page, frame, delay = 420) {
  await frame.evaluate(() => {
    getComputedStyle(document.querySelector('.scenes-panel')).opacity;
    for (const card of document.querySelectorAll('.scene-card')) card.getBoundingClientRect();
  });
  await page.waitForTimeout(delay);
  await readScenePresentation(frame);
  await page.waitForTimeout(320);
  return readScenePresentation(frame);
}

const browser = await chromium.launch({ headless: true });
const errors = [];
const glbRequests = [];
const sceneImageRequests = [];
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
recordErrors(desktop, errors);
desktop.on('request', (request) => {
  if (request.url().includes('vacuum_main.glb')) glbRequests.push(request.url());
  if (/scene_(keyboard|car|desktop)\.jpg/.test(request.url())) sceneImageRequests.push(request.url());
});

await desktop.goto(BASE_URL, { waitUntil: 'networkidle' });
await desktop.waitForTimeout(300);
const lazyBeforeScroll = glbRequests.length === 0 && await desktop.locator('.vacuumViewerFrame').count() === 0;
const projectOrder = await desktop.locator('.projectList > *').evaluateAll((items) => items.map((item) => ({
  title: item.querySelector('h3')?.textContent?.trim(),
  index: item.querySelector('.projectIndex')?.textContent?.trim(),
})));

const frame = await waitForViewer(desktop);
const readyState = await frame.evaluate(() => window.__VACUUM_APP__.getState());
await frame.evaluate(() => {
  window.__VACUUM_APP__.setPlaying(false);
  window.__VACUUM_APP__.setProgress(0);
});
const sceneInitial = await frame.evaluate(() => {
  const panel = document.querySelector('.scenes-panel');
  const rect = panel.getBoundingClientRect();
  return {
    cardCount: document.querySelectorAll('.scene-card').length,
    activeSceneId: window.__VACUUM_APP__.getState().activeSceneId,
    vertical: innerWidth >= 1180,
    inside: rect.left >= -1 && rect.top >= -1 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1,
    width: rect.width,
  };
});
const sceneStateBefore = await frame.evaluate(() => window.__VACUUM_APP__.getState());
await frame.locator('.scene-card[data-scene="car"]').click();
const sceneStateAfter = await frame.evaluate(() => window.__VACUUM_APP__.getState());
const sceneSwitchStable = sceneStateAfter.activeSceneId === 'car'
  && sceneStateAfter.progress === sceneStateBefore.progress
  && sceneStateAfter.playing === sceneStateBefore.playing
  && sceneStateAfter.cameraRadius === sceneStateBefore.cameraRadius
  && JSON.stringify(sceneStateAfter.matrices) === JSON.stringify(sceneStateBefore.matrices);
const neutralViewerBox = await frame.locator('#viewer').boundingBox();
await desktop.mouse.move(
  neutralViewerBox.x + neutralViewerBox.width * 0.52,
  neutralViewerBox.y + neutralViewerBox.height * 0.44,
);
await desktop.waitForTimeout(120);
await frame.evaluate(() => {
  window.__VACUUM_APP__.setScene('keyboard');
  window.__VACUUM_APP__.setProgress(0.5);
});
const hoverBaseline = await frame.evaluate(() => window.__VACUUM_APP__.getState());
const scenesCollapsed = await settleScenePresentation(desktop, frame);
const scenesMutedAtHalf = scenesCollapsed.state.scenesMuted
  && scenesCollapsed.state.previewSceneId === null
  && await frame.evaluate(() => document.body.classList.contains('scenes-muted'));

const headingBox = await frame.locator('.scenes-heading').boundingBox();
await desktop.mouse.move(headingBox.x + headingBox.width * 0.5, headingBox.y + headingBox.height * 0.5);
const headingPreview = await settleScenePresentation(desktop, frame);
const headingHoverExpandsActive = headingPreview.state.previewSceneId === 'keyboard'
  && headingPreview.state.activeSceneId === 'keyboard'
  && headingPreview.panelOpacity > 0.95
  && headingPreview.cards.find((card) => card.id === 'keyboard').size > 170;

const carBoxBeforePreview = await frame.locator('.scene-card[data-scene="car"]').boundingBox();
await desktop.mouse.move(carBoxBeforePreview.x + carBoxBeforePreview.width * 0.5, carBoxBeforePreview.y + carBoxBeforePreview.height * 0.5);
const carPreview = await settleScenePresentation(desktop, frame, 520);
await desktop.screenshot({ path: path.join(OUT, 'vacuum-viewer-scene-hover.png') });
const carHoverIsTemporary = carPreview.state.previewSceneId === 'car'
  && carPreview.state.activeSceneId === 'keyboard'
  && carPreview.cards.find((card) => card.id === 'car').size > 170
  && carPreview.cards.filter((card) => card.id !== 'car').every((card) => Math.abs(card.size - 58) < 3);
const hoverLeavesModelStable = carPreview.state.progress === hoverBaseline.progress
  && carPreview.state.playing === hoverBaseline.playing
  && carPreview.state.cameraRadius === hoverBaseline.cameraRadius
  && JSON.stringify(carPreview.state.matrices) === JSON.stringify(hoverBaseline.matrices);

await frame.evaluate(() => window.__VACUUM_APP__.setPlaying(true));
const playingDuringHoverBefore = await frame.evaluate(() => window.__VACUUM_APP__.getState());
await desktop.waitForTimeout(220);
const playingDuringHoverAfter = await frame.evaluate(() => window.__VACUUM_APP__.getState());
const hoverKeepsPlaybackRunning = playingDuringHoverAfter.playing
  && playingDuringHoverAfter.cycleTime > playingDuringHoverBefore.cycleTime;
await frame.evaluate(() => {
  window.__VACUUM_APP__.setPlaying(false);
  window.__VACUUM_APP__.setProgress(0.5);
});

const carBoxForClick = await frame.locator('.scene-card[data-scene="car"]').boundingBox();
await desktop.mouse.click(carBoxForClick.x + carBoxForClick.width * 0.5, carBoxForClick.y + carBoxForClick.height * 0.5);
const viewerBox = await frame.locator('#viewer').boundingBox();
await desktop.mouse.move(viewerBox.x + viewerBox.width * 0.52, viewerBox.y + viewerBox.height * 0.44);
const sceneAfterLeave = await settleScenePresentation(desktop, frame);
const clickPersistsAfterLeave = sceneAfterLeave.state.activeSceneId === 'car'
  && sceneAfterLeave.state.previewSceneId === null
  && sceneAfterLeave.cards.every((card) => Math.abs(card.size - 58) < 3);

await frame.evaluate(() => window.__VACUUM_APP__.setScene('keyboard'));
await frame.locator('.scene-card[data-scene="keyboard"]').focus();
const keyboardFocus = await settleScenePresentation(desktop, frame);
await desktop.keyboard.press('ArrowRight');
const keyboardArrow = await settleScenePresentation(desktop, frame);
await frame.locator('#playButton').focus();
const keyboardBlur = await settleScenePresentation(desktop, frame);
const keyboardPreviewWorks = keyboardFocus.state.previewSceneId === 'keyboard'
  && keyboardArrow.state.previewSceneId === 'car'
  && keyboardArrow.state.activeSceneId === 'car'
  && keyboardBlur.state.previewSceneId === null;

await frame.evaluate(() => {
  window.__VACUUM_APP__.setProgress(0);
  window.__VACUUM_APP__.setScene('keyboard');
  window.__VACUUM_APP__.setPlaying(true);
});
const scenesRestoredAtAssembly = await frame.evaluate(() => (
  !window.__VACUUM_APP__.getState().scenesMuted
  && document.querySelector('.scene-card.active')?.dataset.scene === 'keyboard'
));
await desktop.screenshot({ path: path.join(OUT, 'vacuum-portfolio-desktop.png') });

await desktop.evaluate(() => {
  document.documentElement.style.scrollBehavior = 'auto';
  document.scrollingElement.scrollTop = 0;
});
await frame.waitForFunction(() => !window.__VACUUM_APP__.getState().playing, null, { timeout: 5000 });
const pausedAway = !(await frame.evaluate(() => window.__VACUUM_APP__.getState().playing));
await desktop.evaluate(() => {
  const shell = document.querySelector('.vacuumViewerShell');
  const rect = shell.getBoundingClientRect();
  document.scrollingElement.scrollTop += rect.top - 120;
});
await frame.waitForFunction(() => window.__VACUUM_APP__.getState().playing, null, { timeout: 5000 });
const resumedOnReturn = await frame.evaluate(() => window.__VACUUM_APP__.getState().playing);

const scrollBefore = await desktop.evaluate(() => scrollY);
const cameraBeforeWheel = await frame.evaluate(() => window.__VACUUM_APP__.getState().cameraRadius);
const iframeBox = await desktop.locator('.vacuumViewerFrame').boundingBox();
await desktop.mouse.move(iframeBox.x + iframeBox.width * 0.5, iframeBox.y + iframeBox.height * 0.46);
await desktop.mouse.wheel(0, 160);
await desktop.waitForTimeout(220);
const scrollAfter = await desktop.evaluate(() => scrollY);
const cameraAfterWheel = await frame.evaluate(() => window.__VACUUM_APP__.getState().cameraRadius);

await desktop.evaluate(() => document.querySelector('.vacuumViewerShell').scrollIntoView({ block: 'center' }));
await desktop.waitForTimeout(220);
await frame.locator('#progressSlider').fill('650');
await frame.locator('button[data-view="side"]').click();
const radiusBeforeZoom = await frame.evaluate(() => window.__VACUUM_APP__.getState().cameraRadius);
await frame.locator('#zoomInButton').click();
await frame.locator('.part-button').first().click();
const interactionState = await frame.evaluate(() => ({
  state: window.__VACUUM_APP__.getState(),
  activeView: document.querySelector('#viewControl button.active')?.dataset.view,
  visibleLabels: document.querySelectorAll('.part-label.visible').length,
  selectedName: document.querySelector('#selectedName')?.textContent,
  labelsSafe: (() => {
    const sceneRight = document.querySelector('.scenes-panel').getBoundingClientRect().right;
    const partsLeft = document.querySelector('.parts-panel').getBoundingClientRect().left;
    const topBottom = document.querySelector('.topbar').getBoundingClientRect().bottom;
    const controlsTop = document.querySelector('.controls').getBoundingClientRect().top;
    return Array.from(document.querySelectorAll('.part-label.visible')).every((label) => {
      const rect = label.getBoundingClientRect();
      return rect.left >= sceneRight && rect.right <= partsLeft && rect.top >= topBottom && rect.bottom <= controlsTop;
    });
  })(),
}));

await desktop.evaluate(() => {
  const shell = document.querySelector('.vacuumViewerShell');
  Object.defineProperty(shell, 'requestFullscreen', { configurable: true, value: undefined });
});
await desktop.locator('.vacuumFullscreenButton').click();
await desktop.waitForSelector('.vacuumViewerShell.isFallbackFullscreen');
await desktop.waitForTimeout(160);
const fallbackEntered = await frame.evaluate(() => window.__VACUUM_APP__.getState().fullscreen);
await desktop.keyboard.press('Escape');
await desktop.waitForTimeout(180);
const fallbackExited = await desktop.locator('.vacuumViewerShell.isFallbackFullscreen').count() === 0;

const directErrors = [];
const direct = await browser.newPage({ viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1 });
recordErrors(direct, directErrors);
await direct.goto(new URL('/vacuum-viewer/index.html', BASE_URL).toString(), { waitUntil: 'networkidle' });
await direct.waitForFunction(() => window.__APP_READY__ === true, null, { timeout: 30000 });
const directBefore = await direct.evaluate(() => window.__VACUUM_APP__.getState());
const tabletScenes = await direct.evaluate(() => {
  const panel = document.querySelector('.scenes-panel').getBoundingClientRect();
  const list = document.querySelector('.scenes-list');
  return {
    vertical: innerWidth >= 1180,
    horizontal: getComputedStyle(list).flexDirection === 'row',
    inside: panel.left >= -1 && panel.top >= -1 && panel.right <= innerWidth + 1 && panel.bottom <= innerHeight + 1,
    scrollable: list.scrollWidth > list.clientWidth,
    activeSceneId: window.__VACUUM_APP__.getState().activeSceneId,
  };
});
await direct.evaluate(() => {
  window.__VACUUM_APP__.setPlaying(false);
  window.__VACUUM_APP__.setProgress(0.5);
});
await settleScenePresentation(direct, direct);
const tabletCarBox = await direct.locator('.scene-card[data-scene="car"]').boundingBox();
await direct.mouse.move(tabletCarBox.x + tabletCarBox.width * 0.5, tabletCarBox.y + tabletCarBox.height * 0.5);
const tabletHoverPreview = await settleScenePresentation(direct, direct, 520);
const tabletHoverWorks = tabletHoverPreview.state.previewSceneId === 'car'
  && tabletHoverPreview.state.activeSceneId === 'keyboard'
  && tabletHoverPreview.cards.find((card) => card.id === 'car').size >= 295;
await direct.screenshot({ path: path.join(OUT, 'vacuum-viewer-tablet.png') });
await direct.mouse.move(560, 360);
await direct.mouse.wheel(0, 180);
await direct.waitForTimeout(180);
const directAfter = await direct.evaluate(() => window.__VACUUM_APP__.getState());
await direct.evaluate(() => window.__VACUUM_APP__.setProgress(0.65));
await direct.waitForTimeout(220);
const tabletLabelsSafe = await direct.evaluate(() => {
  const rightEdge = document.querySelector('.parts-panel').getBoundingClientRect().left;
  const topEdge = document.querySelector('.topbar').getBoundingClientRect().bottom;
  const bottomEdge = document.querySelector('.scenes-panel').getBoundingClientRect().top;
  return Array.from(document.querySelectorAll('.part-label.visible')).every((label) => {
    const rect = label.getBoundingClientRect();
    return rect.left >= 0 && rect.right <= rightEdge && rect.top >= topEdge && rect.bottom <= bottomEdge;
  });
});
await direct.close();
await desktop.close();

const mobileErrors = [];
const mobileContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  hasTouch: true,
  isMobile: true,
});
const mobile = await mobileContext.newPage();
recordErrors(mobile, mobileErrors);
await mobile.goto(BASE_URL, { waitUntil: 'networkidle' });
const mobileFrame = await waitForViewer(mobile);
await mobile.screenshot({ path: path.join(OUT, 'vacuum-portfolio-mobile.png') });
const mobileScenes = await mobileFrame.evaluate(() => {
  const panel = document.querySelector('.scenes-panel').getBoundingClientRect();
  const list = document.querySelector('.scenes-list');
  return {
    inside: panel.left >= -1 && panel.top >= -1 && panel.right <= innerWidth + 1 && panel.bottom <= innerHeight + 1,
    horizontal: getComputedStyle(list).flexDirection === 'row',
    scrollable: list.scrollWidth > list.clientWidth,
    activeSceneId: window.__VACUUM_APP__.getState().activeSceneId,
  };
});
await mobileFrame.locator('#partsButton').click();
const mobilePartsOpen = await mobileFrame.evaluate(() => document.body.classList.contains('parts-open'));
const partsRect = await mobileFrame.locator('.parts-panel').boundingBox();
await mobileFrame.locator('#partsCloseButton').click();
await mobileFrame.evaluate(() => {
  window.__VACUUM_APP__.setPlaying(false);
  window.__VACUUM_APP__.setProgress(0.65);
});
await settleScenePresentation(mobile, mobileFrame);
await mobileFrame.locator('.scene-card[data-scene="car"]').tap();
const mobileTouchLocked = await settleScenePresentation(mobile, mobileFrame, 520);
await mobile.screenshot({ path: path.join(OUT, 'vacuum-viewer-mobile-scene-locked.png') });
const mobileCanvasBox = await mobileFrame.locator('#viewer').boundingBox();
await mobile.touchscreen.tap(
  mobileCanvasBox.x + mobileCanvasBox.width * 0.5,
  mobileCanvasBox.y + mobileCanvasBox.height * 0.38,
);
const mobileTouchUnlocked = await settleScenePresentation(mobile, mobileFrame);
const mobileTouchPreviewWorks = mobileTouchLocked.state.activeSceneId === 'car'
  && mobileTouchLocked.state.previewSceneId === 'car'
  && mobileTouchLocked.state.scenePreviewLocked
  && mobileTouchLocked.cards.find((card) => card.id === 'car').size >= mobileTouchLocked.state.canvas.width * 0.74
  && mobileTouchUnlocked.state.activeSceneId === 'car'
  && mobileTouchUnlocked.state.previewSceneId === null
  && !mobileTouchUnlocked.state.scenePreviewLocked;
const mobileLabelsSafe = await mobileFrame.evaluate(() => {
  const topEdge = document.querySelector('.topbar').getBoundingClientRect().bottom;
  const bottomEdge = document.querySelector('.scenes-panel').getBoundingClientRect().top;
  return Array.from(document.querySelectorAll('.part-label.visible')).every((label) => {
    const rect = label.getBoundingClientRect();
    return rect.left >= 0 && rect.right <= innerWidth && rect.top >= topEdge && rect.bottom <= bottomEdge;
  });
});
await mobileFrame.locator('#moreButton').click();
const mobileMoreOpen = await mobileFrame.evaluate(() => document.body.classList.contains('more-open'));
const mobileLayout = await mobileFrame.evaluate(() => {
  const viewport = { width: innerWidth, height: innerHeight };
  return ['.topbar', '.controls', '#playButton', '#progressSlider', '#viewControl', '#moreButton'].map((selector) => {
    const element = document.querySelector(selector);
    const rect = element.getBoundingClientRect();
    return {
      selector,
      visible: getComputedStyle(element).display !== 'none',
      inside: rect.left >= -1 && rect.top >= -1 && rect.right <= viewport.width + 1 && rect.bottom <= viewport.height + 1,
      rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
      viewport,
    };
  });
});

const report = {
  url: BASE_URL,
  projectOrder,
  lazyLoading: {
    beforeScroll: lazyBeforeScroll,
    glbRequestCount: glbRequests.length,
    sceneImageRequestCount: new Set(sceneImageRequests).size,
  },
  scenes: {
    initial: sceneInitial,
    switchStable: sceneSwitchStable,
    mutedAtHalf: scenesMutedAtHalf,
    hover: {
      headingExpandsActive: headingHoverExpandsActive,
      carIsTemporary: carHoverIsTemporary,
      modelStable: hoverLeavesModelStable,
      playbackContinues: hoverKeepsPlaybackRunning,
      clickPersistsAfterLeave,
      keyboardWorks: keyboardPreviewWorks,
    },
    restoredAtAssembly: scenesRestoredAtAssembly,
  },
  playback: {
    playingWhenReady: readyState.playing,
    pausedAway,
    resumedOnReturn,
  },
  embeddedWheel: {
    pageScrollDelta: scrollAfter - scrollBefore,
    cameraDelta: cameraAfterWheel - cameraBeforeWheel,
  },
  interactions: {
    progress: interactionState.state.progress,
    activeView: interactionState.activeView,
    zoomReducedRadius: interactionState.state.cameraRadius < radiusBeforeZoom,
    selectedName: interactionState.selectedName,
    visibleLabels: interactionState.visibleLabels,
    labelsSafe: interactionState.labelsSafe,
  },
  fullscreenFallback: { entered: fallbackEntered, exited: fallbackExited },
  standalone: {
    embedded: directBefore.embedded,
    playing: directBefore.playing,
    wheelChangedRadius: directAfter.cameraRadius !== directBefore.cameraRadius,
    tabletScenes,
    tabletHoverWorks,
    labelsSafe: tabletLabelsSafe,
  },
  mobile: {
    partsOpen: mobilePartsOpen,
    partsInside: partsRect.x >= -1 && partsRect.x + partsRect.width <= 391,
    moreOpen: mobileMoreOpen,
    scenes: mobileScenes,
    touchPreviewWorks: mobileTouchPreviewWorks,
    labelsSafe: mobileLabelsSafe,
    layout: mobileLayout,
  },
  errors: [...errors, ...directErrors, ...mobileErrors],
};

report.pass = report.errors.length === 0
  && projectOrder.length === 3
  && projectOrder[0].title === '方太模块化移动厨房'
  && projectOrder[0].index === '01'
  && projectOrder[1].title === '手持吸尘器结构设计'
  && projectOrder[1].index === '02'
  && projectOrder[2].title === 'Mouse Dumpling IP 形象设计'
  && projectOrder[2].index === '03'
  && report.lazyLoading.beforeScroll
  && report.lazyLoading.glbRequestCount >= 1
  && report.lazyLoading.sceneImageRequestCount === 3
  && report.scenes.initial.cardCount === 3
  && report.scenes.initial.activeSceneId === 'keyboard'
  && report.scenes.initial.vertical
  && report.scenes.initial.inside
  && report.scenes.initial.width <= 224
  && report.scenes.switchStable
  && report.scenes.mutedAtHalf
  && Object.values(report.scenes.hover).every(Boolean)
  && report.scenes.restoredAtAssembly
  && report.playback.playingWhenReady
  && report.playback.pausedAway
  && report.playback.resumedOnReturn
  && report.embeddedWheel.pageScrollDelta > 0
  && Math.abs(report.embeddedWheel.cameraDelta) < 1e-6
  && Math.abs(report.interactions.progress - 0.65) < 0.002
  && report.interactions.activeView === 'side'
  && report.interactions.zoomReducedRadius
  && report.interactions.selectedName !== '整机'
  && report.interactions.visibleLabels > 0
  && report.interactions.labelsSafe
  && report.fullscreenFallback.entered
  && report.fullscreenFallback.exited
  && report.standalone.embedded === false
  && report.standalone.playing
  && report.standalone.wheelChangedRadius
  && report.standalone.tabletScenes.vertical === false
  && report.standalone.tabletScenes.horizontal
  && report.standalone.tabletScenes.inside
  && report.standalone.tabletScenes.activeSceneId === 'keyboard'
  && report.standalone.tabletHoverWorks
  && report.standalone.labelsSafe
  && report.mobile.partsOpen
  && report.mobile.partsInside
  && report.mobile.moreOpen
  && report.mobile.scenes.inside
  && report.mobile.scenes.horizontal
  && report.mobile.scenes.scrollable
  && report.mobile.scenes.activeSceneId === 'keyboard'
  && report.mobile.touchPreviewWorks
  && report.mobile.labelsSafe
  && report.mobile.layout.filter((item) => item.visible).every((item) => item.inside);

fs.writeFileSync(path.join(OUT, 'vacuum-integration.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify(report, null, 2));
await mobileContext.close();
await browser.close();
