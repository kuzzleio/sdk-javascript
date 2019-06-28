try {
  await kuzzle.ms.zadd('ssetfoo', [
    {member: 'foo', score: '42'},
    {member: 'bar', score: '4'},
    {member: 'baz', score: '-272.15'}
  ]);

  // Prints: 2
  // Counts elements with a score lower than 42 (excluded)
  console.log(await kuzzle.ms.zcount('ssetfoo', '-inf', '(42'));
} catch (error) {
  console.error(error.message);
}
