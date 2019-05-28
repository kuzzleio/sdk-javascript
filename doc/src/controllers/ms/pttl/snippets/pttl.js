try {
  await kuzzle.ms.psetex('foo', 'bar', 60000);

  // Prints: 60000
  console.log(await kuzzle.ms.pttl('foo'));
} catch (error) {
  console.error(error.message);
}
