let room = kuzzle
  .collection('collection', 'index')
  .room()
  .renew({in: {field: ['some', 'new', 'filter']}}, function (err, res) {
    // handle notifications
  });
