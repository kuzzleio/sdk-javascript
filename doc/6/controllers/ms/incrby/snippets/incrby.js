try {
  await kuzzle.ms.set('foo', 100);

  // Prints: 42
  console.log(await kuzzle.ms.incrby('foo', -58));
} catch (error) {
  console.error(error.message);
}
