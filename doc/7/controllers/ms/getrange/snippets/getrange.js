try {
  await kuzzle.ms.set('foo', 'foobar');

  // Prints: 'oba'
  console.log(await kuzzle.ms.getrange('foo', 2, 4));

  // Prints: 'bar'
  console.log(await kuzzle.ms.getrange('foo', -3, -1));
} catch (error) {
  console.error(error.message);
}
