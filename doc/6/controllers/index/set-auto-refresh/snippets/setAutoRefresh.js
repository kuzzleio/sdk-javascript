try {
  const autoRefresh = await kuzzle.index.setAutoRefresh('nyc-open-data', true);

  if (autoRefresh === true) {
    console.log(`Autorefresh flag is set to true`);
  }
} catch (error) {
  console.error(error.message);
}
