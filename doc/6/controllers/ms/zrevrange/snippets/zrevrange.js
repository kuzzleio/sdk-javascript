try {
  await kuzzle.ms.zadd('ssetfoo', [
    {member: 'foo', score: '42'},
    {member: 'bar', score: '4'},
    {member: 'baz', score: '-272.15'}
  ]);

  // Prints:
  // [ { member: 'foo', score: 42 },
  //   { member: 'bar', score: 4 } ]
  console.log(await kuzzle.ms.zrevrange('ssetfoo', 0, 1));
} catch (error) {
  console.error(error.message);
}
