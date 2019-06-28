try {
  await kuzzle.ms.set('hw', 'Hello');

  await kuzzle.ms.append('hw', ' World');

  // Prints: Hello World
  console.log(await kuzzle.ms.get('hw'));
} catch (error) {
  console.error(error.message);
}
