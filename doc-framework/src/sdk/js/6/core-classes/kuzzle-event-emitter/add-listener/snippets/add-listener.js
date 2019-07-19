const eventEmitter = new KuzzleEventEmitter();

eventEmitter.addListener('myEvent', () => console.log('Caught event "myEvent"!'));

// Prints: Caught event "myEvent"!
eventEmitter.emit('myEvent');
