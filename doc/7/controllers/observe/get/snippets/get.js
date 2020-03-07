try {
  await kuzzle.document.create(
    'nyc-open-data',
    'yellow-taxi',
    { capacity: 4 },
    'some-id'
  );

  const observer = await kuzzle.observe.get('nyc-open-data', 'yellow-taxi', 'some-id');

  console.log(observer);
  /*
    Observer {
      _listening: true,
      _index: 'nyc-open-data',
      _collection: 'yellow-taxi',
      _id: 'some-id',
      _source: {
        capacity: 4,
        _kuzzle_info: {
          author: '-1',
          createdAt: 1583515181979,
          updatedAt: null,
          updater: null
        }
      }
    }
  */
} catch (error) {
  console.error(error.message);
}
