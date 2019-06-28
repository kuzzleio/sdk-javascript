try {
  const status = await kuzzle.index.refresh('nyc-open-data');
  console.log(status);
  /*
    { total: 5, successful: 5, failed: 0 }
  */

  console.log(`${status.failed} shards fail to refresh`);
} catch (error) {
  console.error(error.message);
}
