try {
  await kuzzle.ms.set('foo', 'bar', {ex: 60});

  // Prints: 60
  console.log(await kuzzle.ms.ttl('foo'));
} catch (error) {
  console.error(error.message);
}
