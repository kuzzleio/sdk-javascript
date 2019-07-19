const // puppeteer is globally installed in the container
  puppeteer = require('/usr/local/lib/node_modules/puppeteer'),
  renderedSnippetPath = process.argv[2];

const runInBrowser = async snippetPath => {
  let browser;

  try {
    browser = await puppeteer.launch({
      dumpio: true,
      args: ['--no-sandbox']
    });
  } catch (error) {
    console.error(error);
    return;
  }

  try {
    const page = await browser.newPage();

    page.on('error', err => {
      console.error(err);
    });

    page.on('pageerror', err => {
      console.error(err);
    });

    await page.goto(`file:${snippetPath}`, {
      waitUntil: 'networkidle0'
    });
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
};

runInBrowser(renderedSnippetPath);
