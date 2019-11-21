try {
  await kuzzle.ms.zadd('ssetfoo', [
    {member: 'foo', score: '0'},
    {member: 'bar', score: '0'},
    {member: 'baz', score: '0'}
  ]);

  await kuzzle.ms.zremrangebylex('ssetfoo', '[baz', '+');

  // Prints: [ 'bar' ]
  console.log(await kuzzle.ms.zrangebylex('ssetfoo', '-', '+'));
} catch (error) {
  console.error(error.message);
}
