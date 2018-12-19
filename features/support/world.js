const
  { setWorldConstructor } = require('cucumber'),
  {
    Kuzzle,
    Websocket
  } = require('../../index');

class World {
  constructor () {
    this.kuzzle = new Kuzzle(new Websocket({ host: 'localhost', port: 7512 }));

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
