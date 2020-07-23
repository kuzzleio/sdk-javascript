try {

  const actions = [
    { 'action': 'set', 'args': { '_id': 'list:a', 'body': { 'value': 1, 'ex': 100, 'nx': true } } },
    { 'action': 'get', 'args': { '_id': 'list:a' } },
    { 'action': 'del', 'args': { 'body': { 'keys': ['list:a'] } } }];

  // Prints: "[ [ null, 'OK' ], [ null, '1' ], [ null, 1 ] ]"
  console.log(await kuzzle.ms.mexecute(actions));

} catch (error) {
  console.error(error.message);
}
