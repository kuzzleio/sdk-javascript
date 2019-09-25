try {
  await kuzzle.ms.set('key', 'foobar');

  // Prints: 26
  console.log(await kuzzle.ms.bitcount('key'));

  // Prints: 4
  console.log(await kuzzle.ms.bitcount('key', {start: 0, end: 0}));
} catch (error) {
  console.error(error.message);
}
