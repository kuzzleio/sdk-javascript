require('ts-node/register')

/* Script Arguments ==================================================== */

const filePath = process.argv[2];
const outDir = process.argv[3];

if (! filePath || ! outDir) {
  console.log(`Usage: node ${process.argv[1]} <file path> <out dir>`);
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
