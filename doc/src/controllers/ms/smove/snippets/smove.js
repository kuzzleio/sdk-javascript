try {
  await kuzzle.ms.sadd('set1', ['foo', 'bar', 'baz']);
  await kuzzle.ms.sadd('set2', ['qux']);

  await kuzzle.ms.smove('set1', 'set2', 'foo');

  // Prints: [ 'bar', 'baz' ]
  console.log(await kuzzle.ms.smembers('set1'));

  // Prints: [ 'foo', 'qux' ]
  console.log(await kuzzle.ms.smembers('set2'));
} catch (error) {
  console.error(error.message);
}
