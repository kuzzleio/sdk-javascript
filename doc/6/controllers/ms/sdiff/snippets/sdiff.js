try {
  await kuzzle.ms.sadd('ref', ['foo', 'bar', 'baz']);

  await kuzzle.ms.sadd('set1', ['foo', 'hello']);
  await kuzzle.ms.sadd('set2', ['bar', 'world']);

  // Prints: [ 'baz' ]
  console.log(await kuzzle.ms.sdiff('ref', ['set1', 'set2']));
} catch (error) {
  console.error(error.message);
}
