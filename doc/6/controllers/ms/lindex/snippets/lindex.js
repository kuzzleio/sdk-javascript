try {
  await kuzzle.ms.rpush('listfoo', ['foo', 'bar', 'baz']);

  // Prints: bar
  console.log(await kuzzle.ms.lindex('listfoo', 1));
} catch (error) {
  console.error(error.message);
}
