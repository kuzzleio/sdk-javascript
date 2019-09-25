const entries = [
  { key: 'hello', value: 'world' },
  { key: 'foo', value: 'bar' }
];

try {
  await kuzzle.ms.set('foo', 'bar');

  // Prints: false
  // (the entire operation aborted)
  console.log(await kuzzle.ms.msetnx(entries));

  await kuzzle.ms.del('foo');

  // Prints: true
  console.log(await kuzzle.ms.msetnx(entries));
} catch (error) {
  console.error(error.message);
}
