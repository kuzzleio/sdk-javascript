const 
  args = {
    controller: 'controller',
    action: 'action'
  },
  query = {
    body: {
      foo: 'bar'
    },
    other: 'argument'
  };

// Using callbacks (NodeJS or Web Browser)
kuzzle.query(args, query, function (err, res) {
  // ...
});

// Using promises (NodeJS only)
kuzzle
  .queryPromise(args, query)
  .then(result => {

  });
