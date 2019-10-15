const { Before, BeforeAll } = require('cucumber');

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

function clean () {
  const kuzzle = _world.kuzzle;

  return kuzzle.connect()
    .then(() => kuzzle.query({
      controller: 'admin',
      action: 'resetDatabase'
    }))
    .catch(error => {
      // rethrow to get a readable error
      // eslint-disable-next-line no-console
      console.error(error);
      throw error;
    });

}
