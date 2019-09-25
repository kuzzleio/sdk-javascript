try {
  const roomId = await kuzzle.realtime.subscribe(
    'nyc-open-data',
    'yellow-taxi',
    {},
    () => {}
  );

  const count = await kuzzle.realtime.count(roomId);

  console.log(`Currently ${count} active subscription`);
} catch (error) {
  console.error(error.message);
}