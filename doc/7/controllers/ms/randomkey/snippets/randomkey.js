try {
  await kuzzle.ms.set('foo', 'val');
  await kuzzle.ms.set('bar', 'val');
  await kuzzle.ms.set('baz', 'val');

  // Prints one of the following: foo, bar or baz
  console.log(await kuzzle.ms.randomkey());
} catch (error) {
  console.error(error.message);
}
