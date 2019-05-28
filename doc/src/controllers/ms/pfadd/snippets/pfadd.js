try {
  await kuzzle.ms.pfadd('hllfoo', ['foo', 'bar', 'baz', 'qux']);

  // Prints: 4
  console.log(await kuzzle.ms.pfcount('hllfoo'));
} catch (error) {
  console.error(error.message);
}
