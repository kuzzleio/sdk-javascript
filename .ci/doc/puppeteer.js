const puppeteer = require('puppeteer');
const renderedSnippetPath = process.argv[2];

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

const fs = require('fs');

const snippet = fs.readFileSync('/var/snippets/web/gettingstartedbrowservanillacreate_2efbe92.html');
console.log(snippet.toString());

console.dir(fs.statSync('/var/snippets/web/node_modules/kuzzle-sdk/dist/kuzzle.js'), {depth: null, colors: true});


runInBrowser(renderedSnippetPath);


