function callback (notification) {
  console.log(notification);
  /*
  { status: 200,
    requestId: 'e114c5d0-8ad1-4751-9236-772f9fea1b19',
    timestamp: 1539783948258,
    volatile: { sdkVersion: '6.0.0-beta-2' },
    index: 'nyc-open-data',
    collection: 'yellow-taxi',
    controller: 'document',
    action: 'update',
    protocol: 'websocket',
    scope: 'out',
    state: 'done',
    result: { _id: 'AWaCRnfbiSV6vMG7iV_K' },
    type: 'document',
    room: '638dd7b94b86720e6ac3f0617f26f116-ae85604010d1f5c7' }
  */
  console.log(`Document moved ${notification.scope} from the scope`);
}

try {
  // Subscribe to notifications when document leaves the scope
  const filters = { range: { age: { lte: 20 } } };
  const options = { scope: 'out' };

  await kuzzle.realtime.subscribe(
    'nyc-open-data',
    'yellow-taxi',
    filters,
    callback,
    options
  );

  const document = { name: 'nina vkote', age: 19 };

  // The document is in the scope
  const { _id } = await kuzzle.document.create(
    'nyc-open-data',
    'yellow-taxi',
    document
  );

  // The document isn't in the scope anymore
  await kuzzle.document.update('nyc-open-data', 'yellow-taxi', _id, { age: 42 });
} catch (error) {
  console.log(error.message);
}
