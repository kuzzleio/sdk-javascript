try {
  const response = await kuzzle.document.exists('nyc-open-data', 'yellow-taxi', 'some-id');

  console.log(response);
} catch (error) {
  console.error(error.message);
}