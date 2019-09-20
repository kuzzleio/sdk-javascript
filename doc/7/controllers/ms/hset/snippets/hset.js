try {
  await kuzzle.ms.hset('hashfoo', 'foo', 'bar');

  // Prints: { foo: 'bar' }
  console.log(await kuzzle.ms.hgetall('hashfoo'));
} catch (error) {
  console.error(error.message);
}
