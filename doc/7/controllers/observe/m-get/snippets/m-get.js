const doc1 = { capacity: 4 };
const doc2 = { capacity: 7 };

try {
  await kuzzle.document.create('nyc-open-data', 'yellow-taxi', doc1, 'some-id');
  await kuzzle.document.create('nyc-open-data', 'yellow-taxi', doc2, 'some-other-id');

  const observers = await kuzzle.observe.mGet(
    'nyc-open-data',
    'yellow-taxi',
    ['some-id', 'some-other-id']
  );

  console.log(observers);
  /*
    [
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
      },
      Observer {
        _listening: true,
        _index: 'nyc-open-data',
        _collection: 'yellow-taxi',
        _id: 'some-other-id',
        _source: {
          capacity: 7,
          _kuzzle_info: {
            author: '-1',
            createdAt: 1583515181980,
            updatedAt: null,
            updater: null
          }
        }
      }
    ]
  */
} catch (error) {
  console.error(error.message);
}
