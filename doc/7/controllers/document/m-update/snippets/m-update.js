const doc1 = { capacity: 4 };
const doc2 = { capacity: 7 };

try {
  await kuzzle.document.create('nyc-open-data', 'yellow-taxi', doc1, 'some-id');
  await kuzzle.document.create('nyc-open-data', 'yellow-taxi', doc2, 'some-other-id');

  const documents = [
    {
      _id: 'some-id',
      body: { category: 'sedan' }
    },
    {
      _id: 'some-other-id',
      body: { category: 'limousine' }
    }
  ];

  const response = await kuzzle.document.mUpdate(
    'nyc-open-data',
    'yellow-taxi',
    documents
  );

  console.log(response);
  /*
    { successes:
      [ { _id: 'some-id',
          _source: { _kuzzle_info: [Object], category: 'sedan' },
          _version: 2,
          result: 'updated',
          created: false,
          status: 200 },
        { _id: 'some-other-id',
          _source: { _kuzzle_info: [Object], category: 'limousine' },
          _version: 2,
          result: 'updated',
          created: false,
          status: 200 } ],
    errors: [] }
  */
  console.log('Success');
} catch (error) {
  console.error(error.message);
}
