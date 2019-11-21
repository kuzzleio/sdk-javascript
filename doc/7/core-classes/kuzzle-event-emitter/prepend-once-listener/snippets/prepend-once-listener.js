const eventEmitter = new KuzzleEventEmitter();

eventEmitter.addListener('myEvent', () => console.log('listener1'));

eventEmitter.prependOnceListener('myEvent', () => console.log('listener2'));

// Prints:
//   listener2
//   listener1
eventEmitter.emit('myEvent');

// Prints: listener1
// (the listener function printing "listener2" as since been removed)
eventEmitter.emit('myEvent');
