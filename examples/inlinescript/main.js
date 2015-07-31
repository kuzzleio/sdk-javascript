var myDoc = {
    name: 'Rick Astley',
    birthDate: '1966/02/06',
    mainActivity: 'Singer',
    website: 'http://www.rickastley.co.uk',
    comment: 'Never gonna give you up, never gonna let you down'
  },
  kuzzleUrl = 'http://localhost:7512',
  kuzzle = Kuzzle.init(kuzzleUrl);

kuzzle.create('people', myDoc, true, function(error, response) {
  console.log("kuzzle is ok");
  console.log('Error:', error, 'Response:', response);
});
