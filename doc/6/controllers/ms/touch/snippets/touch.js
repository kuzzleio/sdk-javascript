try {
  await kuzzle.ms.set('foo', 'bar');
  await kuzzle.ms.set('baz', 'qux');

  // Prints: 2
  console.log(await kuzzle.ms.touch(['foo', 'baz', 'thedroidsIamlookingfor']));
} catch (error) {
  console.error(error.message);
}
