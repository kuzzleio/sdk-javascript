var kuzzleUrl = 'http://localhost:7512',
  Kuzzle = require('../'),
  kuzzle = Kuzzle.init(kuzzleUrl);

var myDoc = {
  name: 'Rick Astley',
  birthDate: '1966/02/06',
  mainActivity: 'Singer',
  website: 'http://www.rickastley.co.uk',
  comment: 'Never gonna give you up, never gonna let you down'
};

// with callback
kuzzle.create('people', myDoc, true, function(error, response) {
  console.log('Error:', error, 'Response:', response);
});

// with promise
kuzzle
  .createPromise('people', myDoc, true)
  .then(function(response) {
    console.log(response);
  })
  .catch(function(error) {
    console.log(error);
  });
