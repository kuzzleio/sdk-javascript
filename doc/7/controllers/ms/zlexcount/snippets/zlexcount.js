try {
  await kuzzle.ms.zadd('ssetfoo', [
    {member: 'foo', score: '0'},
    {member: 'bar', score: '0'},
    {member: 'baz', score: '0'}
  ]);

  // Prints: 2
  // Lexicographically counts elements with a maximum value of 'f' (excluded),
  // without a minimum value
  console.log(await kuzzle.ms.zlexcount('ssetfoo', '-', '(f'));
} catch (error) {
  console.error(error.message);
}
