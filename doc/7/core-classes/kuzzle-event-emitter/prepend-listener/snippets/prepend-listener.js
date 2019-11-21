const eventEmitter = new KuzzleEventEmitter();

eventEmitter.addListener('myEvent', () => console.log('listener1'));

eventEmitter.prependListener('myEvent', () => console.log('listener2'));

// Prints:
//   listener2
//   listener1
eventEmitter.emit('myEvent');
