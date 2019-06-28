try {
  await kuzzle.ms.pfadd('hllfoo', ['foo', 'bar', 'baz']);
  await kuzzle.ms.pfadd('hllfoo2', ['hello', 'world', 'foo']);

  // Prints: 5
  console.log(await kuzzle.ms.pfcount(['hllfoo', 'hllfoo2']));
} catch (error) {
  console.error(error.message);
}
