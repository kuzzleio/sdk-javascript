try {
  const document = {
    licence: 'B',
    _kuzzle_info: {
      creator: 'liia',
      createdAt: 653132233
    }
  };

  const result = await kuzzle.bulk.write(
    'nyc-open-data',
    'yellow-taxi',
    document
  );

  console.log(result);
  /*
  { _id: 'AWvljct6E7sKlamkyoHl',
    _version: 1,
    _source:
     { licence: 'B',
       _kuzzle_info: { creator: 'liia', createdAt: 653132233 } }
  */

  console.log(`Document creator is ${result._source._kuzzle_info.creator}`);
} catch (error) {
  console.error(error.message);
}
