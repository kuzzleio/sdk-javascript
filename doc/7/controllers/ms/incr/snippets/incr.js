try {
  await kuzzle.ms.set('foo', 41);

  // Prints: 42
  console.log(await kuzzle.ms.incr('foo'));
} catch (error) {
  console.error(error.message);
}
