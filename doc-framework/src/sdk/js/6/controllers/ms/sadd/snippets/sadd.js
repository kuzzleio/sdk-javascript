try {
  // Prints: 2
  console.log(await kuzzle.ms.sadd('setfoo', ['foo', 'bar']));

  // Prints: 1
  console.log(await kuzzle.ms.sadd('setfoo', ['foo', 'bar', 'baz']));

  // Prints: [ 'foo', 'bar', 'baz' ]
  console.log(await kuzzle.ms.smembers('setfoo'));
} catch (error) {
  console.error(error.message);
}
