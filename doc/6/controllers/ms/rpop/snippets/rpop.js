try {
  await kuzzle.ms.rpush('listfoo', ['foo', 'bar', 'baz']);

  // Prints: 'baz'
  console.log(await kuzzle.ms.rpop('listfoo'));

  // Prints: [ 'foo', 'bar' ]
  console.log(await kuzzle.ms.lrange('listfoo', 0, -1));
} catch (error) {
  console.error(error.message);
}
