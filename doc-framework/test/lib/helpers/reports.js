const
  express = require('express'),
  path = require('path'),
  app = express();

/* eslint-disable no-console */

const reportsFolder = path.join(__dirname, '../../../reports/');

app.use(express.static(reportsFolder));

app.get('/reports', (req, res) => {
  res.sendFile(`${reportsFolder}index.html`);
});

app.listen(3001);

console.log('Go to "http://localhost:3001/reports" to see the last report');
