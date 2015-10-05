var
  Promise = require('bluebird'),
  Kuzzle = Promise.promisifyAll(require('../../../lib/kuzzle.js'), {
    //you can choose your own Suffix for promise here
    suffix: 'Promise'
  });

var
  kuzzleUrl = 'http://localhost:7512',
  myDoc = {
    name: 'Rick Astley',
    birthDate: '1966/02/06',
    mainActivity: 'Singer',
    website: 'http://www.rickastley.co.uk',
    comment: 'Never gonna give you up, never gonna let you down'
  },
  kuzzle = Kuzzle.init(kuzzleUrl);

kuzzle
  .createPromise('people', myDoc, true)
  .then(function (response) {
    console.log('Document created in Kuzzle:', response);
  })
  .catch(function (error) {
    console.error(error);
  })
  .finally(function () {
    kuzzle.close();
  });
