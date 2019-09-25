const eventEmitter = new KuzzleEventEmitter();

eventEmitter.addOnceListener(
  'myEvent',
  () => console.log('Caught event "myEvent"!'));

// Prints: Caught event "myEvent"!
eventEmitter.emit('myEvent');

// Prints nothing: the event has since been removed
eventEmitter.emit('myEvent');
