try {
  await kuzzle.collection.deleteSpecifications('nyc-open-data', 'yellow-taxi');

  console.log('Success');
} catch (error) {
  console.error(error.message);
}
