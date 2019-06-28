try {
  const indexes = await kuzzle.index.mDelete(['nyc-open-data', 'mtp-open-data']);
  console.log(indexes);
  /*
    [ 'nyc-open-data', 'mtp-open-data' ]
  */

  console.log(`Successfully deleted ${indexes.length} indexes`);
} catch (error) {
  console.error(error.message);
}
