try {
  const indexes = await kuzzle.index.list();
  console.log(indexes);
  /*
    [ 'nyc-open-data', 'mtp-open-data' ]
  */

  console.log(`Kuzzle contains ${indexes.length} indexes`);
} catch (error) {
  console.error(error.message);
}
