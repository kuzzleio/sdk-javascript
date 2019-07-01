// This template imports the snippet and then creates a document in the
// 'yellow-taxi collection in the `nyc-open-data` index.

[snippet-code]

// Require a kuzzle instance assigning it to a weird variable to avoid collisions and create the instance.
const $k = require('kuzzle-sdk');
const $kInstance = new $k.Kuzzle(new $k.WebSocket('kuzzle'));

// add a listener to detect any connection problems
$kInstance.on('networkError', error => {
  console.error(`[doItAndCreateDocument.tpl] Network Error: ${error}`);
});

$kInstance.connect().then(() => {
  const driver = {
    name: 'Sirkis',
    birthday: '1959-06-22',
    license: 'B'
  };

  return $kInstance.document.create('nyc-open-data', 'yellow-taxi', driver);
}).catch(error => {
  console.error(`[doItAndCreateDocument.tpl] Error creating document: ${error}`);
}).finally(() => {
  $kInstance.disconnect();
});
