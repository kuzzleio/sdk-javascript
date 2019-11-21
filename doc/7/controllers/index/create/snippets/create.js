try {
  await kuzzle.index.create('nyc-open-data');

  console.log('Index created');
} catch (error) {
  console.error(error.message);
}
