try {
  const documents = [
    {
      _id: 'panipokari',
      body: {
        licence: 'B',
        _kuzzle_info: { creator: 'bahi', createdAt: 746186305 }
      }
    },
    {
      body: {
        licence: 'B',
        _kuzzle_info: { creator: 'dahi', createdAt: 835005505 }
      }
    }
  ];

  const result = await kuzzle.bulk.mWrite(
    'nyc-open-data',
    'yellow-taxi',
    documents
  );

  console.log(result);
  /*
  { successes:
    [ { _id: 'panipokari',
        _source: {
          "licence": "B",
          "_kuzzle_info": {
            "creator": "bahi",
            "createdAt": 746186305 } },
        _version: 1 },
      { _id: 'AWvlrMIZE7sKlamkyoHr',
        _source: {
          "licence": "B",
          "_kuzzle_info": {
            "creator": "dahi",
            "createdAt": 835005505 } },
        _version: 1 } ],
    total: 2 }
  */

  console.log(`Document creator is ${result.successes[1]._source._kuzzle_info.creator}`);
} catch (error) {
  console.error(error.message);
}
