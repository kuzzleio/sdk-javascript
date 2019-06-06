try {
  await kuzzle.ms.sadd('setfoo', ['a', 'b', 'c', 'd', 'e', 'f']);

  // Prints one of the elements of setfoo, at random
  console.log(await kuzzle.ms.spop('setfoo'));

  // Prints three of the remaining elements of setfoo, at random
  console.log(await kuzzle.ms.spop('setfoo', {count: 3}));

  // Prints: 2
  console.log(await kuzzle.ms.scard('setfoo'));
} catch (error) {
  console.error(error.message);
}
