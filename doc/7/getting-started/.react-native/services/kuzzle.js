import { Kuzzle, WebSocket } from 'kuzzle-sdk';

const options = {
    offlineMode: 'auto',
    autoReplay: true,
    autoQueue: true,
    autoResubscribe: true
  };

export default new Kuzzle(new WebSocket('localhost'), options);
