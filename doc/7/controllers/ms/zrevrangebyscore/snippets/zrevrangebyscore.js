try {
  await kuzzle.ms.zadd('ssetfoo', [
    {member: 'foo', score: '42'},
    {member: 'bar', score: '4'},
    {member: 'baz', score: '-272.15'}
  ]);

  // Prints:
  // [ { member: 'bar', score: 4 },
  //   { member: 'baz', score: -272.15 } ]
  console.log(await kuzzle.ms.zrevrangebyscore('ssetfoo', '-inf', '(42'));
} catch (error) {
  console.error(error.message);
}
