const doc = { color: 'yellow' };

try {
  await kuzzle.document.create('nyc-open-data', 'yellow-taxi', doc, 'some-id');

  const response = await kuzzle.document.replace(
    'nyc-open-data',
    'yellow-taxi',
    'some-id',
    { capacity: 4, category: 'sedan' }
  );

  console.log(response);
  /*
  { _id: 'some-id',
    _version: 2,
    _source:
    { capacity: 4,
      category: 'sedan',
      _kuzzle_info:
        { author: '-1',
          createdAt: 1538654776456,
          updatedAt: 1538654776456,
          updater: '-1' } } }
  */
  console.log('Success');
} catch (error) {
  console.error(error.message);
}
