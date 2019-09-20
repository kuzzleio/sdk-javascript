try {
  await kuzzle.ms.zadd('ssetfoo', [
    {member: 'foo', score: '42'},
    {member: 'bar', score: '4'},
    {member: 'baz', score: '-272.15'}
  ]);

  // Prints 3
  console.log(await kuzzle.ms.zcard('ssetfoo'));
} catch (error) {
  console.error(error.message);
}
