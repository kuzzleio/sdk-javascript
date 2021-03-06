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
  {
    id: 'some-id',
    _version: 2
  }
  */
} catch (error) {
  console.error(error.message);
}
