try {
  await kuzzle.ms.hmset(
    'hashfoo',
    [
      {field: 'key1', value: 'val1'},
      {field: 'key2', value: 'val2'},
      {field: 'key3', value: 'val3'}
    ]
  );

  // Prints: { key1: 'val1', key2: 'val2', key3: 'val3' }
  console.log(await kuzzle.ms.hgetall('hashfoo'));
} catch (error) {
  console.error(error.message);
}
