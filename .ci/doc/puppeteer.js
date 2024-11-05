const puppeteer = require("puppeteer");
const renderedSnippetPath = process.argv[2];

const runInBrowser = async (snippetPath) => {
  let browser;
  try {
    // Install Chrome browser first
    const { execSync } = require('child_process');
    execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });

    browser = await puppeteer.launch({
      dumpio: true,
      headless: "new",
      // Remove executablePath to use the bundled Chromium
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
      ],
    });
  } catch (error) {
    console.error('Browser launch error:', error);
    process.exit(1);
  }

  try {
    const page = await browser.newPage();

    page.on("error", (err) => {
      console.error('Page error:', err);
    });

    page.on("pageerror", (err) => {
      console.error('Page error:', err);
    });

    page.on('console', msg => {
      console.log('Page console:', msg.text());
    });

    await page.goto(`file:${snippetPath}`, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });
  } catch (error) {
    console.error('Page processing error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

if (!renderedSnippetPath) {
  console.error('Please provide a path to the snippet file');
  process.exit(1);
}

runInBrowser(renderedSnippetPath);