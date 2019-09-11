const { Before, AfterAll, BeforeAll } = require('cucumber');

let _world;

Before(async function () {
  _world = this;
  await clean();
});

BeforeAll(function () {
  this.index = null;
  this.collection = null;
  this.ids = [];
  this.user = null;
  this.jwt = null;

  this.content = null;
  this.error = null;
  this.notifications = [];
});

AfterAll(async function () {
  await clean();
});

async function clean () {
  const kuzzle = _world.kuzzle;

  try {
    await kuzzle.connect();
    const indices = await kuzzle.index.list();

    for (const index of indices) {
      await kuzzle.index.delete(index);
    }
  }
  catch (error) {
    // rethrow to get a readable error
    // eslint-disable-next-line no-console
    console.error(error);
    throw error;
  }

}
