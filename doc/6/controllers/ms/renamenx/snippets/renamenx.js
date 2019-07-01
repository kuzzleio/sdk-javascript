try {
  await kuzzle.ms.set('foo', 'val');
  await kuzzle.ms.set('bar', 'val');

  // Prints: false
  // (the key "bar" already exists)
  console.log(await kuzzle.ms.renamenx('foo', 'bar'));

  // Prints: true
  console.log(await kuzzle.ms.renamenx('foo', 'qux'));
} catch (error) {
  console.error(error.message);
}
