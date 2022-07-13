const { setWorldConstructor } = require("cucumber"),
  { Kuzzle, WebSocket } = require("../../index");

class World {
  constructor() {
    this.kuzzle = new Kuzzle(new WebSocket("localhost", { port: 7512 }));

    this.index = null;
    this.collection = null;
    this.ids = [];
    this.user = null;
    this.jwt = null;
    this.rights = null;
    this.previousJwt = null;

    this.content = null;
    this.error = null;
    this.notifications = [];

    this.callback = (notification) => {
      this.notifications.push(notification);
    };
  }
}

setWorldConstructor(World);
