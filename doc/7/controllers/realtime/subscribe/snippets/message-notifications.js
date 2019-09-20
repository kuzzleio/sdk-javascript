function callback (notification) {
  console.log(notification);
  /*
  { status: 200,
    requestId: '212cc14d-3a4e-4f26-9fe8-6ba6c6279f9d',
    timestamp: 1539702246068,
    volatile: { sdkVersion: '6.0.0-beta-2' },
    index: 'i-dont-exist',
    collection: 'in-database',
    controller: 'realtime',
    action: 'publish',
    protocol: 'websocket',
    scope: 'in',
    state: 'done',
    result:
    { _source:
       { metAt: 'Insane',
         hello: 'world',
         _kuzzle_info:
           { author: '-1',
             createdAt: 1539680191720,
             updatedAt: null,
             updater: null,
             active: true,
             deletedAt: null } },
      _id: null },
    type: 'document',
    room: '24bbb5c44c343167eaf6a023dca8629e-7a90af8c8bdaac1b' }
  */
  console.log('Message notification received');
}

try {
  // Subscribe to a room
  await kuzzle.realtime.subscribe('i-dont-exist', 'in-database', {}, callback);

  // Publish a message to this room
  const message = { metAt: 'Insane', hello: 'world' };

  await kuzzle.realtime.publish('i-dont-exist', 'in-database', message);
} catch (error) {
  console.log(error.message);
}