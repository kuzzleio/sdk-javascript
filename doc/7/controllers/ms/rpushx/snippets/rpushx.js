try {
  // Prints: 0
  // ("listfoo" does not exist: the operation fails)
  console.log(await kuzzle.ms.rpushx('listfoo', 'qux'));

  await kuzzle.ms.rpush('listfoo', ['foo', 'bar', 'baz']);

  // Prints: 4
  console.log(await kuzzle.ms.rpushx('listfoo', 'qux'));
} catch (error) {
  console.error(error.message);
}
