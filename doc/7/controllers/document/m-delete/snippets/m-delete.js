try {
  await kuzzle.document.create('nyc-open-data', 'yellow-taxi', {}, 'some-id');
  await kuzzle.document.create('nyc-open-data', 'yellow-taxi', {}, 'some-other-id');

  const response = await kuzzle.document.mDelete(
    'nyc-open-data',
    'yellow-taxi',
    ['some-id', 'some-other-id']
  );

  console.log(`Successfully deleted ${response.deleted.length} documents`);
} catch (error) {
  console.error(error.message);
}
