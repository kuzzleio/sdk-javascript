try {
  const exists = kuzzle.collection.exists('nyc-open-data', 'green-taxi');

  if (exists) {
    console.log('Success');
  }
} catch (error) {
  console.error(error.message);
}
