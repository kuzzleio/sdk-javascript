try {
  await kuzzle.ms.rpush('listfoo', ['qux', 'bar', 'baz']);

  await kuzzle.ms.lset('listfoo', 0, 'foo');

  // Prints: [ 'foo', 'bar', 'baz' ]
  console.log(await kuzzle.ms.lrange('listfoo', 0, -1));
} catch (error) {
  console.error(error.message);
}
