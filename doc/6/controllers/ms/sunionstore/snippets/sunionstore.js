try {
  await kuzzle.ms.sadd('set1', ['a', 'b', 'c']);
  await kuzzle.ms.sadd('set2', ['d', 'e', 'f']);
  await kuzzle.ms.sadd('set3', ['g', 'h', 'i']);

  // Prints: 9
  console.log(await kuzzle.ms.sunionstore(
    'setdest',
    ['set1', 'set2', 'set3']
  ));

  // Prints: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ]
  console.log(await kuzzle.ms.smembers('setdest'));
} catch (error) {
  console.error(error.message);
}
