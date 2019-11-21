try {
  await kuzzle.ms.zadd('ssetfoo', [
    {member: 'foo', score: '42'},
    {member: 'bar', score: '4'},
    {member: 'baz', score: '-272.15'}
  ]);

  // Prints: 42
  console.log(await kuzzle.ms.zscore('ssetfoo', 'foo'));

  // Prints: 4
  console.log(await kuzzle.ms.zscore('ssetfoo', 'bar'));
} catch (error) {
  console.error(error.message);
}
