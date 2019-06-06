try {
  await kuzzle.ms.sadd('setfoo', [1, 2, 3, 4, 5, 6, 7]);
  await kuzzle.ms.rpush('listfoo', ['foo', 'bar', 'baz', 'qux']);

  // Prints: [ '7', '6', '5', '4', '3', '2', '1' ]
  console.log(await kuzzle.ms.sort('setfoo', {direction: 'DESC'}));

  // Prints: [ 'bar', 'baz', 'foo', 'qux' ]
  console.log(await kuzzle.ms.sort('listfoo', {alpha: true}));
} catch (error) {
  console.error(error.message);
}
