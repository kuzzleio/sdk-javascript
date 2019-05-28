try {
  await kuzzle.ms.set('foo', 'bar');

  // Prints: -1
  console.log(await kuzzle.ms.ttl('foo'));

  await kuzzle.ms.expire('foo', 10);

  // Prints: 10
  console.log(await kuzzle.ms.ttl('foo'));
} catch (error) {
  console.error(error.message);
}
