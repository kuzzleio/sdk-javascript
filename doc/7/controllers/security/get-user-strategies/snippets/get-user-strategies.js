const response = await kuzzle.security.getUserStrategies('john.doe');

console.log(response);
/*
[ 'local' ]
 */
