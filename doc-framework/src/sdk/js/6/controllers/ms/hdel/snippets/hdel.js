try {
  await kuzzle.ms.hset('hashfoo', 'field1', 'val');
  await kuzzle.ms.hset('hashfoo', 'field2', 'val');

  // Prints: 2
  console.log(await kuzzle.ms.hlen('hashfoo'));

  await kuzzle.ms.hdel('hashfoo', ['field2']);

  // Prints: 1
  console.log(await kuzzle.ms.hlen('hashfoo'));
} catch (error) {
  console.error(error.message);
}
