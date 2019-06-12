var
  collection = kuzzle.collection('foo', 'bar'),
  filters = {equals: {foo: 'bar'}},
  room;

/*
* Use case 2 : Subscribe only to documents leaving the scope
*/
room = collection.subscribe(filters, {scope: 'out'}, function(data) {
  console.log('Document moved from the scope: ', data.document);
}).onDone(function(err, res) {
  if (err) {
    console.error('Error while subscribing to the room: ', err);
  } else {
    console.log('Subscription ready');
  }
});
