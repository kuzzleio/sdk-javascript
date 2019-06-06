try {
  await kuzzle.document.create(
    'nyc-open-data',
    'yellow-taxi',
    { capacity: 4 },
    'some-id'
  );

  const response = await kuzzle.document.update(
    'nyc-open-data',
    'yellow-taxi',
    'some-id',
    { category: 'suv' }
  );

  console.log(response);
  /*
  { _index: 'nyc-open-data',
    _type: 'yellow-taxi',
    _id: 'some-id',
    _version: 2,
    result: 'updated',
    _shards: { total: 2, successful: 1, failed: 0 } }
  */
} catch (error) {
  console.error(error.message);
}
