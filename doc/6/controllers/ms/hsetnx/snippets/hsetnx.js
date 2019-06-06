try {
  // Prints: true
  console.log(await kuzzle.ms.hsetnx('hashfoo', 'foo', 'bar'));

  // Prints: false
  console.log(await kuzzle.ms.hsetnx('hashfoo', 'foo', 'qux'));

  // Prints: bar
  console.log(await kuzzle.ms.hget('hashfoo', 'foo'));

} catch (error) {
  console.error(error.message);
}
