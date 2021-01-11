try {
  await kuzzle.document.create(
    'nyc-open-data',
    'yellow-taxi',
    { capacity: 4 },
    'some-id'
  );

  const response = await kuzzle.document.upsert(
    'nyc-open-data',
    'yellow-taxi',
    'some-id',
    { changes: { category: 'suv' } }
  );

  console.log(response);
  /*
  {
    id: 'some-id',
    _version: 2
  }
  */
} catch (error) {
  console.error(error.message);
}
