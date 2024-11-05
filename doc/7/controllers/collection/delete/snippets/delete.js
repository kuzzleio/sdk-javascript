try {
  await kuzzle.collection.delete('nyc-open-data', 'yellow-taxi');

  console.log('Success');
} catch (error) {
  console.error(error.message);
}
