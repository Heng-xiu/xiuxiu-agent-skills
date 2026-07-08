const { chromium } = require('playwright');

async function main() {
  const [,, url, outPath, widthArg] = process.argv;
  const width = widthArg ? parseInt(widthArg, 10) : 1440;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(500);
  // 逐步捲動整頁以觸發 scroll-reveal / IntersectionObserver 動畫
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 400;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.body.scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 120);
    });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
}
main().catch(e => { console.error(e); process.exit(1); });
