try {
  await kuzzle.ms.set('foo', 'World');

  await kuzzle.ms.rename('foo', 'Hello');

  // Prints: World
  console.log(await kuzzle.ms.get('Hello'));
} catch (error) {
  console.error(error.message);
}
