try {
  await kuzzle.ms.hset('hashfoo', 'key1', 'val1');
  await kuzzle.ms.hset('hashfoo', 'key2', 'val2');
  await kuzzle.ms.hset('hashfoo', 'key3', 'val3');

  // Prints: [ 'val1', 'val2', 'val3' ]
  console.log(await kuzzle.ms.hvals('hashfoo'));
} catch (error) {
  console.error(error.message);
}
