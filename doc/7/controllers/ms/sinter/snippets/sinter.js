try {
  await kuzzle.ms.sadd('set1', ['foo', 'bar', 'hello']);
  await kuzzle.ms.sadd('set2', ['world', 'baz', 'foo']);

  // Prints: [ 'foo' ]
  console.log(await kuzzle.ms.sinter(['set1', 'set2']));
} catch (error) {
  console.error(error.message);
}
