const { Before, AfterAll, BeforeAll } = require('cucumber');

let _world;

Before(function () {
  _world = this;
  return clean();
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

AfterAll(function () {
  return clean();
});

function clean () {
  const kuzzle = _world.kuzzle;

  return kuzzle.connect()
    .then(() => kuzzle.index.list())
    .then(indices => Promise.all(indices.map(i => kuzzle.index.delete(i))))
    .catch(error => {
      // rethrow to get a readable error
      // eslint-disable-next-line no-console
      console.error(error);
      throw error;
    });

}
