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

  const response = await kuzzle.document.mReplace(
    'nyc-open-data',
    'yellow-taxi',
    documents
  );

  console.log(response);
  /*
  { hits:
   [ { _id: 'some-id',
       _source: { _kuzzle_info: [Object], category: 'sedan' },
       _index: 'nyc-open-data',
       _type: 'yellow-taxi',
       _version: 2,
       result: 'updated',
       _shards: { total: 2, successful: 1, failed: 0 },
       created: false,
       status: 200 },
     { _id: 'some-other-id',
       _source: { _kuzzle_info: [Object], category: 'limousine' },
       _index: 'nyc-open-data',
       _type: 'yellow-taxi',
       _version: 2,
       result: 'updated',
       _shards: { total: 2, successful: 1, failed: 0 },
       created: false,
       status: 200 } ],
  total: 2 }
  */
  console.log('Success');
} catch (error) {
  console.error(error.message);
}
