try {
  await kuzzle.ms.rpush('foo', ['rick', 'astley', 'never']);
  await kuzzle.ms.rpush('bar', ['gonna', 'give', 'you', 'up']);

  // Prints: never
  console.log(await kuzzle.ms.rpoplpush('foo', 'bar'));

  // Prints: [ 'never', 'gonna', 'give', 'you', 'up' ]
  console.log(await kuzzle.ms.lrange('bar', 0, -1));
} catch (error) {
  console.error(error.message);
}
