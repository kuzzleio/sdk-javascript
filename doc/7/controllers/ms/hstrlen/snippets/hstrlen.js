try {
  await kuzzle.ms.hset('hashfoo', 'foo', 'bar');

  // Prints: 3
  console.log(await kuzzle.ms.hstrlen('hashfoo', 'foo'));
} catch (error) {
  console.error(error.message);
}
