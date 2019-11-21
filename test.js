// Loads the Kuzzle SDK modules
const {
  Kuzzle,
  WebSocket,
  Http
} = require('./index');

// Instantiates a Kuzzle client with the Http protocol
// Replace 'kuzzle' with your Kuzzle server hostname (e.g. 'localhost')
const kuzzle = new Kuzzle(
  new WebSocket('localhost')
);

let i = 0;
// Adds a listener to detect any connection problems
kuzzle.on('disconnected', () => {
  console.log('disconnected')
  if (i > 5) {
    console.log('Max tries')
    kuzzle.disconnect()
  }
  i++;
})
kuzzle.on('reconnected', () => console.log('reconnected'))

const run = async () => {
  try {
    // Connects to the Kuzzle server
    await kuzzle.connect();
    // await kuzzle.index.create('nyc-open-data')
    // await kuzzle.collection.create('nyc-open-data', 'yellow-taxi')

    // const documents = [
    //   {
    //     _id: 'some-id',
    //     body: { 'capacity': 4 }
    //   },
    //   {
    //     body: { this: 'document id is auto-computed' }
    //   }
    // ];
    // const response = await kuzzle.document.mCreate(
    //   'nyc-open-data',
    //   'yellow-taxi',
    //   documents
    // );

    // console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error(error);
  }
};

run();