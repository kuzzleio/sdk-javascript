try {
  // Prints: 0
  console.log(await kuzzle.ms.lpushx('listfoo', 'foo'));

  // Prints: []
  console.log(await kuzzle.ms.lrange('listfoo', 0, -1));

  await kuzzle.ms.lpush('listfoo', ['bar']);

  // Prints: 2
  console.log(await kuzzle.ms.lpushx('listfoo', 'foo'));

  // Prints: [ 'foo', 'bar' ]
  console.log(await kuzzle.ms.lrange('listfoo', 0, -1));
} catch (error) {
  console.error(error.message);
}
