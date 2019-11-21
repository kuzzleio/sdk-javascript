try {
  await kuzzle.ms.hset('hashfoo', 'foo', 'bar');

  // Prints: 'bar'
  console.log(await kuzzle.ms.hget('hashfoo', 'foo'));
} catch (error) {
  console.error(error.message);
}
