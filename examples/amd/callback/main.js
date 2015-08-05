require.config({
  paths: {
    // Kuzzle has only one dependency : socket.io
    "socket.io": '../lib/socket.io-1.3.4',
    "kuzzle": "../lib/kuzzle"
  }
});

require(['kuzzle'], function(Kuzzle) {

  var myDoc = {
      name: 'Rick Astley',
      birthDate: '1966/02/06',
      mainActivity: 'Singer',
      website: 'http://www.rickastley.co.uk',
      comment: 'Never gonna give you up, never gonna let you down'
    },
    kuzzleUrl = 'http://localhost:7512';

  var kuzzle = Kuzzle.init(kuzzleUrl);

  // with callback
  kuzzle.create('people', myDoc, true, function(error, response) {
    console.log('doc created into Kuzzle');
    document.querySelector("#kuzzle").innerHTML = "ok";
  });

});
