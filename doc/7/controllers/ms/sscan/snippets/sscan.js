try {
  await kuzzle.ms.sadd('setfoo', ['foo', 'bar', 'baz']);

  // Prints:
  // {
  //   cursor: '0',
  //   values: [ bar', 'baz' ]
  // }
  console.log(await kuzzle.ms.sscan('setfoo', 0, {match: 'ba*'}));
} catch (error) {
  console.error(error.message);
}
