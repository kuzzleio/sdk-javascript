var kuzzle = new Kuzzle('localhost', {
  defaultIndex: 'some index',
  autoReconnect: true,
  headers: {someheader: "value"},
  port: 7512
});

// A callback is also available and will be invoked once connected to the Kuzzle instance:
kuzzle = new Kuzzle('localhost', function (err, res) {
  // ...
});
