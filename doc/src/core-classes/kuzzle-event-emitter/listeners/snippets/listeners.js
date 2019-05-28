const eventEmitter = new KuzzleEventEmitter();

eventEmitter.addListener('myEvent', () => console.log('Hello'));
eventEmitter.addListener('myEvent', () => console.log('Hello World'));

const listeners = eventEmitter.listeners('myEvent');

console.log(`There are ${listeners.length} listeners bound to the event "myEvent"`);
