try {
  await kuzzle.ms.zadd('ssetfoo', [
    {member: 'foo', score: '42'},
    {member: 'bar', score: '4'},
    {member: 'baz', score: '-272.15'}
  ]);

  // Prints:
  // {
  //   cursor: '0',
  //   values: [ 'baz', '-272.15', 'bar', '4', 'foo', '42' ]
  // }
  console.log(await kuzzle.ms.zscan('ssetfoo', 0));
} catch (error) {
  console.error(error.message);
}
