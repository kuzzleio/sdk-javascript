try {
  await kuzzle.collection.truncate('nyc-open-data', 'yellow-taxi');

  console.log('Success');
} catch (error) {
  console.error(error.message);
}
