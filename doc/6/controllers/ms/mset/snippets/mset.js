try {
  // Prints: 0
  console.log(await kuzzle.ms.exists(['key1', 'key2', 'key3']));

  await kuzzle.ms.mset([
    { key: 'key1', value: 'val1' },
    { key: 'key2', value: 'val2' },
    { key: 'key3', value: 'val3' }
  ]);

  // Prints: 3
  console.log(await kuzzle.ms.exists(['key1', 'key2', 'key3']));
} catch (error) {
  console.error(error.message);
}
