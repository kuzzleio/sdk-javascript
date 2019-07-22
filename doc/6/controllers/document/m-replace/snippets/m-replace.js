try {
  await kuzzle.document.create('nyc-open-data', 'yellow-taxi', {}, 'some-id');
  await kuzzle.document.create('nyc-open-data', 'yellow-taxi', {}, 'some-other-id');

  const documents = [
    {
      _id: 'some-id',
      body: { capacity: 4 }
    },
    {
      _id: 'some-other-id',
      body: { capacity: 4 }
    }
  ];

  const response = await kuzzle.document.mReplace(
    'nyc-open-data',
    'yellow-taxi',
    documents
  );

  console.log(response);
  /*
  {  hits:
     [ { _id: 'some-id',
       _source:
        { _kuzzle_info:
           { active: true,
             author: '-1',
             updater: null,
             updatedAt: null,
             deletedAt: null,
             createdAt: 1538639586995 },
          capacity: 4 },
       _index: 'nyc-open-data',
       _type: 'yellow-taxi',
       _version: 2,
       result: 'updated',
       _shards: { total: 2, successful: 1, failed: 0 },
       created: false,
       status: 200 },
     { _id: 'some-other-id',
       _source:
        { _kuzzle_info:
           { active: true,
             author: '-1',
             updater: null,
             updatedAt: null,
             deletedAt: null,
             createdAt: 1538639586995 },
          capacity: 4 },
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
