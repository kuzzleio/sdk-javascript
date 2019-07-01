const eventEmitter = new KuzzleEventEmitter();

eventEmitter.addListener('myEvent', () => console.log('Caught event "myEvent" (1)'));
eventEmitter.addListener('myEvent', () => console.log('Caught event "myEvent" (2)'));

// Prints:
//   Caught event "myEvent" (1)
//   Caught event "myEvent" (2)
eventEmitter.emit('myEvent');

eventEmitter.removeAllListeners('myEvent');

// Prints nothing: all events have been removed
eventEmitter.emit('myEvent');

if (eventEmitter.listeners('myEvent').length === 0) {
  console.log('Successfully removed all listeners');
}
