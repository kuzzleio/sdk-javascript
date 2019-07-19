try {
  await kuzzle.ms.set('foo', 123);
  await kuzzle.ms.rpush('listfoo', ['foo', 'bar', 'baz']);
  await kuzzle.ms.sadd('setfoo', ['foo', 'bar', 'baz']);

  // Prints: string
  console.log(await kuzzle.ms.type('foo'));

  // Prints: list
  console.log(await kuzzle.ms.type('listfoo'));

  // Prints: set
  console.log(await kuzzle.ms.type('setfoo'));
} catch (error) {
  console.error(error.message);
}
