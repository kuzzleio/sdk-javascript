try {
  await kuzzle.ms.rpush('listfoo', ['foo', 'bar', 'baz']);

  // Prints: 3
  console.log(await kuzzle.ms.llen('listfoo'));
} catch (error) {
  console.error(error.message);
}
