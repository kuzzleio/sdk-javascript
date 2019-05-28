try {
  await kuzzle.ms.hset('hashfoo', 'key1', 'val1');
  await kuzzle.ms.hset('hashfoo', 'key2', 'val2');
  await kuzzle.ms.hset('hashfoo', 'key3', 'val3');

  // Prints:
  // {
  //   cursor: '0',
  //   values: [ 'key1', 'val1', 'key2', 'val2', 'key3', 'val3' ]
  // }
  console.log(await kuzzle.ms.hscan('hashfoo', 0));
} catch (error) {
  console.error(error.message);
}
