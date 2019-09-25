try {
  await kuzzle.ms.zadd('ssetfoo', [
    {member: 'foo', score: '42'},
    {member: 'bar', score: '4'},
    {member: 'baz', score: '-272.15'}
  ]);

  await kuzzle.ms.zremrangebyrank('ssetfoo', 1, 2);

  // Prints: [ { member: 'baz', score: -272.15 } ]
  console.log(await kuzzle.ms.zrange('ssetfoo', 0, -1));
} catch (error) {
  console.error(error.message);
}
