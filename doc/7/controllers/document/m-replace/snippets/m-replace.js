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
  { successes:
     [ { _id: 'some-id',
         _version: 2,
         _source: {
           _kuzzle_info:
           { author: '-1',
             updater: null,
             updatedAt: null,
             createdAt: 1538639586995 },
          capacity: 4 }
     },
     [ { _id: 'some-other-id',
         _version: 2,
         _source: {
           _kuzzle_info:
           { author: '-1',
             updater: null,
             updatedAt: null,
             createdAt: 1538639586995 },
          capacity: 4 } ],
    errors: [] }
  */
  console.log('Success');
} catch (error) {
  console.error(error.message);
}
