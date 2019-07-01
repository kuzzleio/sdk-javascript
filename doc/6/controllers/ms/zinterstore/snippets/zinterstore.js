try {
  await kuzzle.ms.zadd('sset1', [
    {member: 'foo', score: '42'},
    {member: 'bar', score: '4'},
    {member: 'baz', score: '-272.15'}
  ]);

  await kuzzle.ms.zadd('sset2', [
    {member: 'foo', score: '-29'},
    {member: 'baz', score: '300'}
  ]);

  // Sums scores of intersected values
  await kuzzle.ms.zinterstore('destsum', ['sset1', 'sset2']);

  // Stores the minimum possible scores of intersected values
  await kuzzle.ms.zinterstore(
    'destmin',
    ['sset1', 'sset2'],
    {aggregate: 'min'}
  );

  // Prints:
  // [ { member: 'foo', score: 13 },
  //   { member: 'baz', score: 27.85 } ]
  console.log(await kuzzle.ms.zrange('destsum', 0, -1));

  // Prints:
  // [ { member: 'baz', score: -272.15 },
  //   { member: 'foo', score: -29 } ]
  console.log(await kuzzle.ms.zrange('destmin', 0, -1));
} catch (error) {
  console.error(error.message);
}
