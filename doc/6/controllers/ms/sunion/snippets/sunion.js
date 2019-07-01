try {
  await kuzzle.ms.sadd('set1', ['a', 'b', 'c']);
  await kuzzle.ms.sadd('set2', ['d', 'e', 'f']);
  await kuzzle.ms.sadd('set3', ['g', 'h', 'i']);

  // Prints: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ]
  console.log(await kuzzle.ms.sunion(['set1', 'set2', 'set3']));
} catch (error) {
  console.error(error.message);
}
