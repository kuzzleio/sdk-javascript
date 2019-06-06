try {
  await kuzzle.ms.set('foo', 'bar');

  // Prints: -1
  console.log(await kuzzle.ms.ttl('foo'));

  await kuzzle.ms.pexpire('foo', 60000);

  // Prints: 60
  console.log(await kuzzle.ms.ttl('foo'));
} catch (error) {
  console.error(error.message);
}
