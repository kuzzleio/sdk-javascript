try {
  await kuzzle.ms.pfadd('hllfoo', ['foo', 'bar', 'baz']);
  await kuzzle.ms.pfadd('hllfoo2', ['hello', 'world', 'foo']);

  await kuzzle.ms.pfmerge('hllmerged', ['hllfoo', 'hllfoo2']);

  // Prints: 5
  console.log(await kuzzle.ms.pfcount(['hllmerged']));
} catch (error) {
  console.error(error.message);
}
