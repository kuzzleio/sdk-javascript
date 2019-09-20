try {
  await kuzzle.ms.sadd('foo', ['bar', 'baz']);

  // Prints: hashtable
  console.log(await kuzzle.ms.object('foo', 'encoding'));
} catch (error) {
  console.error(error.message);
}
