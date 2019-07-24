const Kuzzle = require('./index').Kuzzle;

const kuzzle = new Kuzzle('websocket', { host: 'localhost', port: 7512 });

(async () => {
  try {
    await kuzzle.connect()
    await kuzzle.realtime.publish('toto', 'titi', {hello: Date.now()})

    // await kuzzle.index.create('index');
    // await kuzzle.collection.create('index', 'collection');
    //
    // const doc = await kuzzle.document.create(
    //   'index',
    //   'collection',
    //   null,
    //   { hello: 'world' },
    //   { refresh: 'wait_for' }
    // );
    // console.log(doc);
    //
    // const document = await kuzzle.document.get('index', 'collection', doc._id);
    //
    // console.log(document);
  } catch (error) {
    console.log(error);
  }
})()
