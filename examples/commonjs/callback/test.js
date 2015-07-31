//var socketio
var Kuzzle = require('../../../lib/kuzzle.js')

var kuzzleUrl = 'http://localhost:7512',
  myDoc = {
    name: 'Rick Astley',
    birthDate: '1966/02/06',
    mainActivity: 'Singer',
    website: 'http://www.rickastley.co.uk',
    comment: 'Never gonna give you up, never gonna let you down'
  };

kuzzle = Kuzzle.init(kuzzleUrl);

// with callback
kuzzle.create('people', myDoc, true, function(error, response) {
  console.log("kuzzle is ok");
  console.log(response);
  //Stop Kuzzle
  kuzzle.close();
});
