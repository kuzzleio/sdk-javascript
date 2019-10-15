try {
  await kuzzle.index.create('nyc-open-data');
} catch (error) {
  if (error.status === 412) {
    console.log(error.message);
    console.log('Try with another name!');
  }
}
