try {
  await kuzzle.index.create('nyc-open-data');
} catch (error) {
  if (error.status === 400) {
    console.log(error.message);
    console.log('Try with another name!');
  }
}
