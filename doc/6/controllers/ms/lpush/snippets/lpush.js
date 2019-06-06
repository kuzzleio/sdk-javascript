try {
  await kuzzle.ms.rpush('listfoo', ['foobar']);

  // Prints: 3
  console.log(await kuzzle.ms.lpush('listfoo', ['World', 'Hello']));

  // Prints: [ 'Hello', 'World', 'foobar' ]
  console.log(await kuzzle.ms.lrange('listfoo', 0, -1));
} catch (error) {
  console.error(error.message);
}
