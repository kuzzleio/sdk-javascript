require.config({
  paths: {
    // Promisification purpose
    "bluebird": "./bluebird",
    // Kuzzle has only one dependency : socket.io
    "socket.io": 'amd_deps/socket.io-1.3.4',
    "kuzzle": "lib/kuzzle"
  }
});

require(['bluebird', 'kuzzle'], function(Promise, Kuzzle) {

  var myDoc = {
      name: 'Rick Astley',
      birthDate: '1966/02/06',
      mainActivity: 'Singer',
      website: 'http://www.rickastley.co.uk',
      comment: 'Never gonna give you up, never gonna let you down'
    },
    kuzzleUrl = 'http://localhost:7512',
    kuzzle = Kuzzle.init(kuzzleUrl);

  Kuzzle = Promise.promisifyAll(Kuzzle, {
    suffix: 'Promise'
  });

  Kuzzle.init(kuzzleUrl);

  setTimeout(function() {
    Kuzzle.createPromise('people', myDoc, true)
      .then(function(response) {
        console.log('doc created into Kuzzle');
        document.querySelector("#kuzzle").innerHTML = "ok";
      })
      .catch(function(error) {
        console.log(error);
      });

  }, 2000);

});
