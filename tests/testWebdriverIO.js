var webdriverio = require('webdriverio'),
  browserA = null,
  browserB = null,
  tests = [{
      args: ["inline", "callback"]
    }, {
      args: ["inline", "promise"]
    }, {
      args: ["amd", "callback"]
    }, {
      args: ["amd", "promise"]
    }
  ];

//launch node.js server (to serve test and examples)
var server = require('../examples/example.server.js');

var KUZZLE_URL = "http://";
var address = server.server.address();

if (address.address == '::')
  KUZZLE_URL += 'localhost';
else
  KUZZLE_URL += address.address;
if (address.port)
  KUZZLE_URL += ":" + address.port;

describe('Document Creation JS Flavor SDK', function() {

  beforeEach(function() {
    this.timeout(5000);
    browserA = webdriverio.multiremote({
      desiredCapabilities: {
        browserName: 'firefox'
      }
    }).init();
  });

  tests.forEach(function(test) {
    it('all document are created with ' + test.args[0] + ' for ' + test.args[1], function(done) {
      this.timeout(20000);
      browserA
        .url(KUZZLE_URL + "/" + test.args[0] + '/' + test.args[1])
        .pause(3000)
        .getText('#kuzzle').then(function(text) {
          console.log("text is " + text);
          if (text === "ok")
            done();
        });
    });
  });

  afterEach(function() {
    browserA.end();
  });

});

describe('Subscription JS Flavor SDK', function() {

  beforeEach(function() {
    this.timeout(5000);
    browserA = webdriverio.multiremote({
      desiredCapabilities: {
        browserName: 'firefox'
      }
    }).init();

    browserB = webdriverio.multiremote({
      desiredCapabilities: {
        browserName: 'firefox'
      }
    }).init();
  });

  tests.forEach(function(test) {
    console.log("current :  " + test.args[0]);
    it('correctly adds ' + test.args[0] + ' args', function(done) {
      this.timeout(15000);
      browserA.url(KUZZLE_URL + '/subscribe')
        .then(function() {
          browserB.url(KUZZLE_URL + "/" + test.args[0] + '/' + test.args[1])
        }).
      pause(4000)
        .getText('#kuzzle-subscription*=Never gonna give you up, never gonna let you down').then(function(message) {
          done();
        });
    });
  });

  afterEach(function() {
    if (browserA)
      browserA.end();
    if (browserB)
      browserB.end();
  });

});
