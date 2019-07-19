try {

  await kuzzle.ms.sadd('setfoo', ['a', 'b', 'c', 'd', 'e', 'f']);

  // Prints one of the elements of setfoo, at random
  console.log(await kuzzle.ms.srandmember('setfoo'));

  // Prints three elements of setfoo, at random
  console.log(await kuzzle.ms.srandmember('setfoo', {count: 3}));
} catch (error) {
  console.error(error.message);
}
