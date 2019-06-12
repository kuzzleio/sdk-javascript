var
  collection = kuzzle.collection('foo', 'bar'),
  filters = {equals: {foo: 'bar'}},
  room;

/*
* Use case 3 : Create a Room with custom options and add some listeners to it
*/

// create the room:
room = collection.room(
  filters,
  {state: 'all', scope: 'in', users: 'all', subscribeToSelf: false}
);

// listen to notifications about new documents:
room.on('document', function(data) {
  if (data.state === 'done') {
    console.log('New document within the scope: ', data.document);
  }
});

// listen to notifications about other users subscribing to the same room:
room.on('user', function(data) {
  if (data.user === 'in') {
    console.log('A user has joigned the room', data.volatile);
    console.log('Number of listening users: ', data.result.count);
  }
});

// listen to notifications about other users leaving the same room:
room.on('user', function(data) {
  if (data.user == 'out') {
    console.log('A user has leaved the room', data.volatile);
    console.log('Number of listening users: ', data.result.count);
  }
});

// subscribe to the room:
room.subscribe(function(err, res) {
  if (err) {
    console.error('Error while subscribing to the room: ', err);
  } else {
    console.log('Subscription ready');
  }
});
