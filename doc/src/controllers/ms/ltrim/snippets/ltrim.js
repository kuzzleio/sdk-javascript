try {
  await kuzzle.ms.rpush('listfoo', ['a', 'b', 'c', 'd', 'e', 'f']);

  await kuzzle.ms.ltrim('listfoo', 3, -2);

  // Prints [ 'd', 'e' ]
  console.log(await kuzzle.ms.lrange('listfoo', 0, -1));
} catch (error) {
  console.error(error.message);
}
