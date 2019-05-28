try {
  await kuzzle.ms.set('foo', 'abcdef');

  // Prints: 6
  console.log(await kuzzle.ms.strlen('foo'));
} catch (error) {
  console.error(error.message);
}
