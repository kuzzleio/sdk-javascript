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
  { _index: 'nyc-open-data',
  _type: 'yellow-taxi',
  _id: 'some-id',
  _version: 2,
  result: 'updated',
  _shards: { total: 2, successful: 1, failed: 0 },
  created: false,
  _source:
   { capacity: 4,
     category: 'sedan',
     _kuzzle_info:
      { author: '-1',
        createdAt: 1538654776456,
        updatedAt: 1538654776456,
        updater: '-1',
        active: true,
        deletedAt: null } } }
  */
  console.log('Success');
} catch (error) {
  console.error(error.message);
}
