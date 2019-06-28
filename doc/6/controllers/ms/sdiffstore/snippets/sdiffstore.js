try {
  await kuzzle.ms.sadd('ref', ['foo', 'bar', 'baz']);

  await kuzzle.ms.sadd('set1', ['foo', 'hello']);
  await kuzzle.ms.sadd('set2', ['bar', 'world']);

  await kuzzle.ms.sdiffstore('ref', ['set1', 'set2'], 'diffs');

  // Prints: [ 'baz' ]
  console.log(await kuzzle.ms.smembers('diffs'));
} catch (error) {
  console.error(error.message);
}
