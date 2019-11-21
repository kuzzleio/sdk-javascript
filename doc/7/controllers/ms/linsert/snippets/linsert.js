try {
  await kuzzle.ms.rpush('listfoo', ['foo', 'bar', 'baz']);

  await kuzzle.ms.linsert('listfoo', 'before', 'bar', 'qux');

  // Prints: [ 'foo', 'qux', 'bar', 'baz' ]
  console.log(await kuzzle.ms.lrange('listfoo', 0, -1));
} catch (error) {
  console.error(error.message);
}
