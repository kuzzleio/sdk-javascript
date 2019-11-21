try {
  await kuzzle.ms.sadd('listfoo', ['foo', 'bar', 'baz']);

  // Prints: [ 'foo', 'bar', 'baz' ]
  console.log(await kuzzle.ms.smembers('listfoo'));
} catch (error) {
  console.error(error.message);
}
