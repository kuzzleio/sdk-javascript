try {
  await kuzzle.ms.sadd('setfoo', ['foo', 'foo', 'bar', 'baz']);

  // Prints: 3
  console.log(await kuzzle.ms.scard('setfoo'));
} catch (error) {
  console.error(error.message);
}
