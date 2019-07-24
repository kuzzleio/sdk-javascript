const {
  Kuzzle,
  WebSocket,
} = require('./index');

const
  kuzzle = new Kuzzle(
    new WebSocket('localhost')
  );

kuzzle.on('networkError', error => {
  console.error('Network Error:', error);
});

(async () => {
  try {
    await kuzzle.connect();

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

    console.log(JSON.stringify(result, null, 2));
    /*

    */

    console.log(`Document creator is ${result.hits[0]._source._kuzzle_info.creator}`);

  } catch (error) {
    console.log(JSON.stringify(error, null, 2))
    console.log(error.message);
  } finally {
    kuzzle.disconnect()
  }
})();
