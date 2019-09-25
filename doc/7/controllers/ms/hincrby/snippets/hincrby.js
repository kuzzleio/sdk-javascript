try {
  await kuzzle.ms.hset('hashfoo', 'answer', 100);

  // Prints: 42
  console.log(await kuzzle.ms.hincrby('hashfoo', 'answer', -58));
} catch (error) {
  console.error(error.message);
}
