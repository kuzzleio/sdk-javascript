document
  .subscribe(function (error, notification) {
    // called each time a change occurs on this document
  })
  .onDone(function (error, roomObject) {
    // Handles the subscription result
  });

document
  .subscribe({subscribeToSelf: true, volatile: { myId: 'someId'}}, function (error, notification) {
    // called each time a change occurs on this document
  })
  .onDone(function (error, roomObject) {
    // Handles the subscription result
  });
