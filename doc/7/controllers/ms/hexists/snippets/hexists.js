try {
  // Prints: false
  console.log(await kuzzle.ms.hexists('hashfoo', 'foo'));

  await kuzzle.ms.hset('hashfoo', 'foo', 'bar');

  // Prints: true
  console.log(await kuzzle.ms.hexists('hashfoo', 'foo'));
} catch (error) {
  console.error(error.message);
}
