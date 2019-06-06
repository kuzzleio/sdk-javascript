try {
  await kuzzle.ms.zadd('ssetfoo', [
    {member: 'foo', score: '0'},
    {member: 'bar', score: '0'},
    {member: 'baz', score: '0'}
  ]);

  // Prints: [ 'baz', 'bar' ]
  // Lexicographically gets elements with a maximum value of 'f' (excluded),
  // without a minimum value
  console.log(await kuzzle.ms.zrevrangebylex('ssetfoo', '-', '(f'));
} catch (error) {
  console.error(error.message);
}
