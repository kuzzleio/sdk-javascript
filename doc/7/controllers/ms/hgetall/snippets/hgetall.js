try {
  await kuzzle.ms.hset('hashfoo', 'field1', 'val1');
  await kuzzle.ms.hset('hashfoo', 'field2', 'val2');

  // Prints: { field1: 'val1', field2: 'val2' }
  console.log(await kuzzle.ms.hgetall('hashfoo'));
} catch (error) {
  console.error(error.message);
}
