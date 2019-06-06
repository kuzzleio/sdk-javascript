try {
  await kuzzle.ms.rpush('listfoo', ['foo', 'bar', 'foo', 'baz', 'foo']);

  // Prints: 2
  console.log(await kuzzle.ms.lrem('listfoo', 2, 'foo'));

  // Prints: [ 'bar', 'baz', 'foo' ]
  console.log(await kuzzle.ms.lrange('listfoo', 0, -1));
} catch (error) {
  console.error(error.message);
}
