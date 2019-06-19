kuzzle
  .collection('collection', 'index')
  .subscribe({equals: {title: 'foo'}}, function (error, result) {
    // called each time a new notification on this filter is received
    // check the Room/Notifications section of this documentation
    // to get notification examples
  })
  .onDone(function (err, roomObject) {
    // Handles the subscription result. Can be chained.
  });
