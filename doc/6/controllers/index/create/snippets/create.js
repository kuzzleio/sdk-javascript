try {
  const response = await kuzzle.index.create('nyc-open-data');
  console.log(response);
  /*
    { acknowledged: true,
      shards_acknowledged: true }
  */

  console.log('Index created');
} catch (error) {
  console.error(error.message);
}
