try {
  await kuzzle.ms.rpush('listfoo', ['a', 'b', 'c', 'd', 'e', 'f']);

  // Prints: [ 'b', 'c', 'd' ]
  console.log(await kuzzle.ms.lrange('listfoo', 1, 3));

  // Prints: [ d', 'e' ]
  console.log(await kuzzle.ms.lrange('listfoo', 3, -2));
} catch (error) {
  console.error(error.message);
}
