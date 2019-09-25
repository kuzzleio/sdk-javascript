try {
  await kuzzle.collection.refresh('nyc-open-data', 'yellow-taxi');

  console.log('Refresh successful');
} catch (error) {
  console.error(error.message);
}
