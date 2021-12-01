require('ts-node/register')

/* Script Arguments ==================================================== */

const filePath = process.argv[2];
const className = process.argv[3];
const outDir = process.argv[4];

if (! filePath || ! className || ! outDir) {
  console.log(`Usage: node ${process.argv[1]} <file path> <class name> <out dir>`);
}

/* ===================================================================== */

const { ClassExtractor } = require('./ClassExtractor');
const { MarkdownFormatter } = require('./MarkdownFormatter');

const formatter = new MarkdownFormatter(outDir, './templates');
const extractor = new ClassExtractor(filePath);

extractor.on('class', (info) => {
  formatter.onClass(info);
});

extractor.extract();
