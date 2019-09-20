try {
  kuzzle.index.delete('nyc-open-data');

  console.log('Index deleted');
} catch (error) {
  console.error(error.message);
}
