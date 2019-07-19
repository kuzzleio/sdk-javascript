try {
  await kuzzle.ms.psetex('foo', 'bar', 60000);

  // Prints: 60
  console.log(await kuzzle.ms.ttl('foo'));

  // Prints: bar
  console.log(await kuzzle.ms.get('foo'));
} catch (error) {
  console.error(error.message);
}
