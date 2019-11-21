try {
  const roomId = await kuzzle.realtime.subscribe(
    'nyc-open-data',
    'yellow-taxi',
    {},
    () => {}
  );

  await kuzzle.realtime.unsubscribe(roomId);

  console.log('Success');
} catch (error) {
  console.error(error.message);
}