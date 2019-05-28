try {
  await kuzzle.ms.sadd('set1', ['foo', 'bar', 'hello']);
  await kuzzle.ms.sadd('set2', ['world', 'baz', 'foo']);

  // Prints: 1
  console.log(await kuzzle.ms.sinterstore('dest', ['set1', 'set2']));

  // Prints: [ 'foo' ]
  console.log(await kuzzle.ms.smembers('dest'));
} catch (error) {
  console.error(error.message);
}
