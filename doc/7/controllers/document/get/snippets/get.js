try {
  await kuzzle.document.create(
    'nyc-open-data',
    'yellow-taxi',
    { capacity: 4 },
    'some-id'
  );

  const response = await kuzzle.document.get('nyc-open-data', 'yellow-taxi', 'some-id');
  /*
  { _index: 'nyc-open-data',
    _type: 'yellow-taxi',
    _id: 'some-id',
    _version: 1,
    found: true,
    _source:
    { capacity: 4,
      _kuzzle_info:
        { author: '-1',
          createdAt: 1538409095673,
          updatedAt: null,
          updater: null,
          active: true,
          deletedAt: null } } }
  */

  console.log('Success');
} catch (error) {
  console.error(error.message);
}
