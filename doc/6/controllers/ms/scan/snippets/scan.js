try {
  await kuzzle.ms.set('key1', 'val1');
  await kuzzle.ms.set('key2', 'val2');
  await kuzzle.ms.set('key3', 'val3');

  // Prints:
  // {
  //   cursor: '0',
  //   values: [ 'key1', 'key2', 'key3' ]
  // }
  console.log(await kuzzle.ms.scan(0));
} catch (error) {
  console.error(error.message);
}
