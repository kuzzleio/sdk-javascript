const {setWorldConstructor} = require('cucumber');
const Kuzzle = require('../../src/Kuzzle');

class World {
  constructor () {
    this.kuzzle = new Kuzzle('websocket', {host: 'kuzzle', port: 7512});

    this.index = null;
    this.collection = null;
    this.ids = [];
    this.user = null;
    this.jwt = null;

    this.content = null;
    this.error = null;
    this.notifications = [];

    this.callback = notification => {
      this.notifications.push(notification);
    };
  }

}

setWorldConstructor(World);

