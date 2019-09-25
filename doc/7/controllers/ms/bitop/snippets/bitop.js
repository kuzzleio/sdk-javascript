try {
  await kuzzle.ms.set('key1', 'foobar');
  await kuzzle.ms.set('key2', 'abcdef');

  await kuzzle.ms.bitop('dest', 'AND', ['key1', 'key2']);

  // Prints: `bc`ab
  console.log(await kuzzle.ms.get('dest'));
} catch (error) {
  console.error(error.message);
}
