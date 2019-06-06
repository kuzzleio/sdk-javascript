try {
  await kuzzle.ms.hset('hashfoo', 'key1', 'val1');
  await kuzzle.ms.hset('hashfoo', 'key2', 'val2');
  await kuzzle.ms.hset('hashfoo', 'key3', 'val3');

  // Prints: [ 'val3', 'val1' ]
  console.log(await kuzzle.ms.hmget('hashfoo', ['key3', 'key1']));

} catch (error) {
  console.error(error.message);
}
