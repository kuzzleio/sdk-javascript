try {
  await kuzzle.ms.zadd('ssetfoo', [
    {member: 'foo', score: '42'},
    {member: 'bar', score: '4'},
    {member: 'baz', score: '-272.15'}
  ]);

  // Prints: 2
  console.log(await kuzzle.ms.zrank('ssetfoo', 'foo'));

  // Prints: null
  console.log(await kuzzle.ms.zrank('ssetfoo', 'qux'));
} catch (error) {
  console.error(error.message);
}
