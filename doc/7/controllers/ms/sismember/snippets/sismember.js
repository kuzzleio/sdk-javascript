try {
  await kuzzle.ms.sadd('setfoo', ['foo', 'bar', 'baz']);

  // Prints: true
  console.log(await kuzzle.ms.sismember('setfoo', 'bar'));

  // Prints: false
  console.log(await kuzzle.ms.sismember('setfoo', 'qux'));
} catch (error) {
  console.error(error.message);
}
