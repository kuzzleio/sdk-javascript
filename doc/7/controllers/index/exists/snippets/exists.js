try {
  const exists = await kuzzle.index.exists('nyc-open-data');

  if (exists === true) {
    console.log('Index exists');
  } else {
    console.log('Index does not exists');
  }
} catch (error) {
  console.error(error.message);
}
