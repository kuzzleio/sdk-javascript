const eventEmitter = new KuzzleEventEmitter();

const listener = () => console.log('disconnected');

eventEmitter
  .addListener('disconnected', () => console.log('disconnected'))
  .addListener('disconnected', listener);

eventEmitter.removeListener('disconnected', listener);

if (eventEmitter.listeners('disconnected').length === 1) {
  console.log('Successfully removed the listener');
}
