import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.goto('http://localhost/Plateforme%20de%20quiz%20en%20ligne/', { waitUntil: 'networkidle' });

  const title = await page.title();
  console.log('Page title:', title);

  const h1 = await page.textContent('h1');
  console.log('H1 text:', h1);

  const startBtn = await page.textContent('#btnStart');
  console.log('Start button:', startBtn);

  await page.screenshot({ path: 'mcp-test-screenshot.png', fullPage: true });
  console.log('Screenshot saved: mcp-test-screenshot.png');

  await page.click('#btnStart');

  const questionText = await page.textContent('#questionText');
  console.log('First question:', questionText);

  await page.screenshot({ path: 'mcp-test-quiz.png', fullPage: true });
  console.log('Quiz screenshot saved: mcp-test-quiz.png');

  await browser.close();
  console.log('Playwright MCP test completed successfully!');
})();
