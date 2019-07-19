try {
  await kuzzle.ms.set('foo', 'bar');
  await kuzzle.ms.set('Suddenly', 'Bananas');
  await kuzzle.ms.set('Hello', 'World');

  // Prints: [ 'foo', 'Hello' ]
  console.log(await kuzzle.ms.keys('*o'));
} catch (error) {
  console.error(error.message);
}
