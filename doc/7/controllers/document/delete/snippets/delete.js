try {
  const id = await kuzzle.document.delete('nyc-open-data', 'yellow-taxi', 'some-id');

  if (id === 'some-id') {
    console.log('Success');
  }
} catch (error) {
  console.error(error.message);
}