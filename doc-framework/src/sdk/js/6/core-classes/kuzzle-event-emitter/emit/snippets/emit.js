const eventEmitter = new KuzzleEventEmitter();

eventEmitter.addListener('helloEvent', msg => console.log(`Hello ${msg}`));

eventEmitter.emit('helloEvent', 'World');
