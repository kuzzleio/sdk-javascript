const strategies = await kuzzle.security.getUserStrategies('john.doe');

console.log(strategies);
// [ 'local' ]
