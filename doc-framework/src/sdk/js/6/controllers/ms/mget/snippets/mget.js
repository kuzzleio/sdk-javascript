try {
  await kuzzle.ms.set('foo', 'bar');
  await kuzzle.ms.set('hello', 'world');

  // Prints: [ 'world', 'bar' ]
  console.log(await kuzzle.ms.mget(['hello', 'foo']));
} catch (error) {
  console.error(error.message);
}
