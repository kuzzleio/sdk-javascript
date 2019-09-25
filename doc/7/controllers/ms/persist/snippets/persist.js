try {
  await kuzzle.ms.setex('foo', 'bar', 60);

  // Prints: 60
  console.log(await kuzzle.ms.ttl('foo'));

  await kuzzle.ms.persist('foo');

  // Prints: -1
  console.log(await kuzzle.ms.ttl('foo'));
} catch (error) {
  console.error(error.message);
}
