try {
  await kuzzle.ms.zadd('sset1', [
    {member: 'foo', score: '42'},
    {member: 'bar', score: '4'}
  ]);

  await kuzzle.ms.zadd('sset2', [
    {member: 'foo', score: '-29'},
    {member: 'baz', score: '300'}
  ]);

  // Sums scores of joined values
  await kuzzle.ms.zunionstore('destsum', ['sset1', 'sset2']);

  // Stores the minimum possible scores of joined values
  await kuzzle.ms.zunionstore(
    'destmin',
    ['sset1', 'sset2'],
    {aggregate: 'min'}
  );

  // Prints:
  // [ { member: 'bar', score: 4 },
  //   { member: 'foo', score: 13 },
  //   { member: 'baz', score: 300 } ]
  console.log(await kuzzle.ms.zrange('destsum', 0, -1));

  // Prints:
  // [ { member: 'foo', score: -29 },
  //   { member: 'bar', score: 4 },
  //   { member: 'baz', score: 300 } ]
  console.log(await kuzzle.ms.zrange('destmin', 0, -1));
} catch (error) {
  console.error(error.message);
}
