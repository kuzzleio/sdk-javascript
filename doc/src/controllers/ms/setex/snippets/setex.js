try {
  await kuzzle.ms.setex('foo', 'bar', 60);

  // Prints: 60
  console.log(await kuzzle.ms.ttl('foo'));

  // Prints: bar
  console.log(await kuzzle.ms.get('foo'));
} catch (error) {
  console.error(error.message);
}
