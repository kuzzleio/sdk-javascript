var2
  collection = kuzzle.collection('foo', 'bar'),
  filters = {equals: {foo: 'bar'}},
  room;

/*
* Use case 1 : Simple subscription to document changes with default scope/state options
*/
room = collection.subscribe(filters, function(data) {
  if (data.scope === 'in') {
    console.log('New document within the scope: ', data.document);
  } else if (data.scope === 'out') {
    console.log('Document moved from the scope: ', data.document);
  }
}).onDone(function(err, res) {
  if (err) {
    console.error('Error while subscribing to the room: ', err);
  } else {
    console.log('Subscription ready');
  }
});
