try {
  const { result } = await kuzzle.document.exists('nyc-open-data', 'yellow-taxi', 'some-id');

  if (result) {
    console.log('Success');
  }
} catch (error) {
  console.error(error.message);
}