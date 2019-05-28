try {
  await kuzzle.ms.sadd('setfoo', ['foo', 'bar', 'baz']);

  // Prints: 2
  console.log(await kuzzle.ms.srem('setfoo', ['bar', 'baz']));

  // Prints: ['foo']
  console.log(await kuzzle.ms.smembers('setfoo'));
} catch (error) {
  console.error(error.message);
}
