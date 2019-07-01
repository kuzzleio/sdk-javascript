try {
  // Prints: true
  console.log(await kuzzle.ms.setnx('foo', 'bar'));

  // Prints: false
  console.log(await kuzzle.ms.setnx('foo', 'qux'));

  // Prints: bar
  console.log(await kuzzle.ms.get('foo'));
} catch (error) {
  console.error(error.message);
}
