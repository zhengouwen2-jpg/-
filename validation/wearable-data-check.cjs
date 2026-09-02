const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const outputDirectory = path.join(__dirname, 'wearable-data');

async function run() {
  fs.mkdirSync(outputDirectory, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const sizes = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 1024, height: 768 },
    { name: 'mobile', width: 390, height: 844 },
  ];
  const progressSteps = [
    { name: 'direct', value: 0.5 },
  ];

  for (const size of sizes) {
    const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
    const storyMetrics = await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
      const story = document.querySelector('.wearableStory');
      return {
        top: window.scrollY + story.getBoundingClientRect().top,
        distance: Math.max(1, story.offsetHeight - window.innerHeight),
      };
    });

    for (const step of progressSteps) {
      await page.evaluate(({ progress, top, distance }) => {
        const rawStage = 0.5 + progress;
        window.scrollTo(0, top + distance * (rawStage / 4));
      }, { progress: step.value, ...storyMetrics });
      await page.waitForTimeout(900);

      const state = await page.evaluate(() => {
        const stage = document.querySelector('.wearableStage');
        const panels = [...document.querySelectorAll('.researchPanel')].map((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            className: element.className,
            rect: [rect.x, rect.y, rect.width, rect.height].map((value) => Math.round(value)),
            opacity: style.opacity,
            visibility: style.visibility,
          };
        });
        return {
          activeTitle: document.querySelector('.wearableNarrative h3')?.textContent,
          sources: [...document.querySelectorAll('.researchSource summary')].map((element) => element.textContent.trim()),
          panels,
        };
      });

      await page.screenshot({ path: path.join(outputDirectory, `${size.name}-${step.name}.png`) });
      console.log(JSON.stringify({ viewport: size.name, step: step.name, state, consoleErrors }));
    }
    await page.close();
  }
  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
