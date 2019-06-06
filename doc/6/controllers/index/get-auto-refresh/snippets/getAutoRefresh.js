try {
  const status = await kuzzle.index.getAutoRefresh('nyc-open-data');

  console.log(`autorefresh is ${status}`);
} catch (error) {
  console.error(error.message);
}
