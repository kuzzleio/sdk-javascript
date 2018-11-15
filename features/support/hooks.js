const {Before, AfterAll, BeforeAll} = require('cucumber');

let _world;

Before(async function () {
  _world = this;
  await clean();
});

BeforeAll(function () {
  this.index = null;
  this.collection = null;
  this.ids = [];
  this.notifications = [];

  this.content = null;
  this.error = null;
});

AfterAll(async function () {
  await clean();
});

async function clean () {
  const kuzzle = _world.kuzzle;

  await kuzzle.connect();
  const indices = await kuzzle.index.list();

  for (const index of indices) {
    await kuzzle.index.delete(index);
  }
}
