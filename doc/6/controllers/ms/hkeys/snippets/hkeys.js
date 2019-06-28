try {
  await kuzzle.ms.hset('hashfoo', 'never', 'foo');
  await kuzzle.ms.hset('hashfoo', 'gonna', 'bar');
  await kuzzle.ms.hset('hashfoo', 'give you up', 'baz');

  // Prints: ['never', 'gonna', 'give you up']
  console.log(await kuzzle.ms.hkeys('hashfoo'));
} catch (error) {
  console.error(error.message);
}
