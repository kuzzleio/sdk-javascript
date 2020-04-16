const { Kuzzle, Http } = require('./index');

const kuzzle = new Kuzzle(new Http('localhost'))

kuzzle.on('networkError', console.error);

const run = async () => {
  await kuzzle.connect()

  const result = await kuzzle.document.search('nyc-open-data', 'yellow-taxi', {
    query: {
      range: {
        age: {
          lte: 8,
          gte: 5
        }
      }
    }
  });

  // Documents with age between 5 and 8
  console.log(result.hits);
};

run().catch(error => console.log(error));
