try {
  await kuzzle.ms.rpush('listfoo', ['foo', 'bar', 'baz']);

  // Prints: foo
  console.log(await kuzzle.ms.lpop('listfoo'));

  // Prints: [ 'bar', 'baz' ]
  console.log(await kuzzle.ms.lrange('listfoo', 0, -1));
} catch (error) {
  console.error(error.message);
}
