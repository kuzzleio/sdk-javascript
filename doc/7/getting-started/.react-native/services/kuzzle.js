import { Kuzzle, WebSocket } from 'kuzzle-sdk';

const options = {
    offlineMode: 'auto'
  };

export default new Kuzzle(new WebSocket('localhost'), options);
